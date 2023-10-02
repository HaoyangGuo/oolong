import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChannelType, MemberRole, Profile, Server } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ServerService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  private async getProfile(userId: string): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (!profile) {
      throw new UnauthorizedException();
    }

    return profile;
  }

  async defaultServer(userId: string): Promise<Server | {}> {
    const profile = await this.getProfile(userId);

    return await this.prisma.server.findFirst({
      where: {
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        channels: {
          where: {
            name: 'general',
          },
        },
      },
    });
  }

  async server(userId: string, serverId: string): Promise<Server> {
    const profile = await this.getProfile(userId);

    const server = await this.prisma.server.findUnique({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        channels: {
          orderBy: {
            createdAt: 'asc',
          },
        },
        members: {
          include: {
            profile: true,
          },
          orderBy: {
            role: 'asc',
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    return server;
  }

  async servers(userId: string): Promise<Server[]> {
    const profile = await this.getProfile(userId);

    return await this.prisma.server.findMany({
      where: {
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        channels: {
          where: {
            name: 'general',
          },
        },
      },
    });
  }

  async createServer(
    userId: string,
    name: string,
    image: Express.Multer.File,
  ): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!name || !name.trim()) {
      throw new BadRequestException("Server name can't be empty");
    }

    if (!image) {
      throw new BadRequestException("Server image can't be empty");
    }

    const result = await this.cloudinaryService.uploadFile(image);
    const { secure_url: imageUrl, public_id: imagePublicId } = result;

    return await this.prisma.server.create({
      data: {
        profileId: profile.id,
        name,
        imageUrl,
        imagePublicId,
        inviteCode: uuidv4(),
        channels: {
          create: [{ name: 'general', profileId: profile.id }],
        },
        members: {
          create: [{ profileId: profile!.id, role: MemberRole.ADMIN }],
        },
      },
    });
  }

  async updateServer(
    userId: string,
    serverId: string,
    name: string | undefined,
    image: Express.Multer.File | undefined,
  ) {
    const profile = await this.getProfile(userId);

    if (!serverId) {
      throw new BadRequestException("Server ID can't be empty");
    }

    const existingServer = await this.prisma.server.findUnique({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    if (!existingServer) {
      throw new NotFoundException("Server doesn't exist");
    }

    let updateData: Partial<Server> = {};

    if (image) {
      const result = await this.cloudinaryService.uploadFile(image);
      const { secure_url: imageUrl, public_id: imagePublicId } = result;

      if (existingServer.imagePublicId) {
        await this.cloudinaryService.deleteFile(existingServer.imagePublicId);
      }

      updateData.imageUrl = imageUrl;
      updateData.imagePublicId = imagePublicId;
    }

    if (name && name !== existingServer.name) {
      updateData.name = name;
    }

    if (Object.keys(updateData).length) {
      await this.prisma.server.update({
        where: {
          id: serverId,
          profileId: profile.id,
        },
        data: updateData,
      });
    }

    return await this.prisma.server.findUnique({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });
  }

  async joinServer(userId: string, inviteCode: string): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!inviteCode) {
      throw new BadRequestException("Invite code can't be empty");
    }

    const existingServer = await this.prisma.server.findUnique({
      where: {
        inviteCode: inviteCode,
      },
      include: {
        members: true,
      }
    });

    if (!existingServer) {
      throw new NotFoundException("Server doesn't exist");
    }

    if (
      existingServer.members.find((member) => member.profileId === profile.id)
    ) {
      throw new BadRequestException("You're already a member of this server");
    }

    const server = await this.prisma.server.update({
      where: {
        inviteCode: inviteCode,
      },
      data: {
        members: {
          create: [{ profileId: profile.id }],
        },
      },
      include: {
        channels: {
          where: {
            name: 'general',
          },
        },
      },
    });

    return server;
  }

  async updateServerInviteCode(
    userId: string,
    serverId: string,
  ): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!serverId) {
      throw new BadRequestException("Server ID can't be empty");
    }

    const existingServer = await this.prisma.server.findUnique({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    if (!existingServer) {
      throw new NotFoundException("Server doesn't exist");
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        inviteCode: uuidv4(),
      },
    });

    return server;
  }

  async updateMemberRole(
    userId: string,
    serverId: string,
    memberId: string,
    role: MemberRole,
  ) {
    if (role !== MemberRole.GUEST && role !== MemberRole.MODERATOR) {
      throw new BadRequestException('Invalid role');
    }

    const profile = await this.getProfile(userId);

    if (!serverId) {
      throw new BadRequestException("Server ID can't be empty");
    }

    if (!memberId) {
      throw new BadRequestException("Member ID can't be empty");
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          update: {
            where: {
              id: memberId,
              profileId: {
                not: profile.id,
              },
            },
            data: {
              role,
            },
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException("Server doesn't exist");
    }

    return server;
  }

  async deleteServer(userId: string, serverId: string): Promise<Server> {
    const profile = await this.getProfile(userId);

    const server = await this.prisma.server.delete({
      where: {
        id: serverId,
        profileId: profile.id,
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    return server;
  }

  async removeMember(userId: string, serverId: string, memberId: string) {
    const profile = await this.getProfile(userId);
    if (!serverId) {
      throw new BadRequestException("Server ID can't be empty");
    }

    if (!memberId) {
      throw new BadRequestException("Member ID can't be empty");
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        profileId: profile.id,
      },
      data: {
        members: {
          delete: {
            id: memberId,
            profileId: {
              not: profile.id,
            },
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException("Server doesn't exist");
    }

    return server;
  }

  async leaveServer(userId: string, serverId: string): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!serverId) {
      throw new BadRequestException();
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        profileId: {
          not: profile.id,
        },
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      data: {
        members: {
          deleteMany: {
            profileId: profile.id,
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    return server;
  }

  async deleteChannel(
    userId: string,
    serverId: string,
    channelId: string,
  ): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!serverId || !channelId) {
      throw new BadRequestException();
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          delete: {
            id: channelId,
            name: {
              not: 'general',
            },
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    return server;
  }

  async updateChannel(
    userId: string,
    serverId: string,
    channelId: string,
    name: string,
    type: ChannelType,
  ): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!serverId || !channelId || name === 'general') {
      throw new BadRequestException();
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: {
              in: [MemberRole.ADMIN, MemberRole.MODERATOR],
            },
          },
        },
      },
      data: {
        channels: {
          update: {
            where: {
              id: channelId,
            },
            data: {
              name,
              type,
            },
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    return server;
  }
}
