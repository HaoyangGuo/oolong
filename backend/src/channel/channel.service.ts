import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Channel, ChannelType, MemberRole, Profile, Server } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ChannelService {
  constructor(private readonly prisma: PrismaService) {}

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

  async createChannel(
    userId: string,
    channelName: string,
    channelType: ChannelType,
    serverId,
  ): Promise<Server> {
    const profile = await this.getProfile(userId);

    if (!channelName || !channelType || !serverId) {
      throw new BadRequestException();
    }

    if (channelName === 'general') {
      throw new BadRequestException();
    }

    if (Object.values(ChannelType).indexOf(channelType) === -1) {
      throw new BadRequestException();
    }

    const server = await this.prisma.server.update({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
            role: { in: [MemberRole.ADMIN, MemberRole.MODERATOR] },
          },
        },
      },
      data: {
        channels: {
          create: {
            profileId: profile.id,
            name: channelName,
            type: channelType,
          },
        },
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    return server;
  }

  async getChannel(
    userId: string,
    serverId: string,
    channelId: string,
  ): Promise<Channel> {
    if (!serverId || !channelId) {
      throw new BadRequestException();
    }
    const profile = await this.getProfile(userId);

    const member = await this.prisma.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
      },
    });

    if (!profile || !member) {
      throw new UnauthorizedException();
    }

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
      },
    });

    if (!channel) {
      throw new NotFoundException();
    }

    return channel;
  }
}
