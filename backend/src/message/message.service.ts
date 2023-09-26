import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import {
  MemberRole,
  Profile,
  Message,
  DirectMessage,
} from '@prisma/client';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MessageService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}
  private MESSAGES_PER_PAGE = 15;

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

  async getMessages(userId: string, channelId: string, cursor: string) {
    const profile = await this.getProfile(userId);

    if (!channelId) {
      throw new BadRequestException();
    }

    let messages: Message[] = [];

    if (cursor) {
      messages = await this.prisma.message.findMany({
        take: this.MESSAGES_PER_PAGE,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      messages = await this.prisma.message.findMany({
        take: this.MESSAGES_PER_PAGE,
        where: {
          channelId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    let nextCursor = null;
    if (messages.length === this.MESSAGES_PER_PAGE) {
      nextCursor = messages[messages.length - 1].id;
    }

    return { messages, nextCursor };
  }

  async getDirectMessages(
    userId: string,
    conversationId: string,
    cursor: string,
  ) {
    const profile = await this.getProfile(userId);

    let messages: DirectMessage[] = [];

    if (cursor) {
      messages = await this.prisma.directMessage.findMany({
        take: this.MESSAGES_PER_PAGE,
        skip: 1,
        cursor: {
          id: cursor,
        },
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    } else {
      messages = await this.prisma.directMessage.findMany({
        take: this.MESSAGES_PER_PAGE,
        where: {
          conversationId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
    }

    let nextCursor = null;
    if (messages.length === this.MESSAGES_PER_PAGE) {
      nextCursor = messages[messages.length - 1].id;
    }

    return { messages, nextCursor };
  }

  async createMessage(
    userId: string,
    serverId: string,
    channelId: string,
    content: string,
    image: Express.Multer.File,
  ) {
    const profile = await this.getProfile(userId);

    if (!serverId || !channelId || !content) {
      console.log(serverId, channelId, content);
      throw new BadRequestException();
    }

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
        members: true,
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    const channel = await this.prisma.channel.findUnique({
      where: {
        id: channelId,
        serverId: server.id,
      },
    });

    if (!channel) {
      throw new NotFoundException();
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id,
    );

    if (!member) {
      throw new UnauthorizedException();
    }

    let message: Message;

    if (image) {
      const result = await this.cloudinaryService.uploadFile(image);
      const { secure_url: imageUrl, public_id: imagePublicId } = result;

      message = await this.prisma.message.create({
        data: {
          content,
          imageUrl,
          channelId: channel.id,
          memberId: member.id,
          imagePublicId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    } else {
      message = await this.prisma.message.create({
        data: {
          content,
          channelId: channel.id,
          memberId: member.id,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const channelKey = `chat:${channel.id}:messages`;
    return { channelKey, message };
  }

  async createDirectMessage(
    userId: string,
    conversationId: string,
    content: string,
    image: Express.Multer.File,
  ) {
    const profile = await this.getProfile(userId);

    if (!conversationId || !content) {
      console.log(conversationId, content);
      throw new BadRequestException();
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            }
          },
          {
            memberTwo: {
              profileId: profile.id,
            }
          }
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          }
        },
        memberTwo: {
          include: {
            profile: true,
          }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException();
    }

    const member = conversation.memberOne.profile.id === profile.id ? conversation.memberOne : conversation.memberTwo;

    if (!member) {
      throw new UnauthorizedException();
    }

    let message: DirectMessage;

    if (image) {
      const result = await this.cloudinaryService.uploadFile(image);
      const { secure_url: imageUrl, public_id: imagePublicId } = result;

      message = await this.prisma.directMessage.create({
        data: {
          content,
          imageUrl,
          conversationId: conversation.id,
          memberId: member.id,
          imagePublicId,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    } else {
      message = await this.prisma.directMessage.create({
        data: {
          content,
          conversationId: conversation.id,
          memberId: member.id,
        },
        include: {
          member: {
            include: {
              profile: true,
            },
          },
        },
      });
    }

    const channelKey = `chat:${conversationId}:messages`;
    return { channelKey, message };
  }

  async deleteMessage(
    userId: string,
    messageId: string,
    serverId: string,
    channelId: string,
  ) {
    const profile = await this.getProfile(userId);

    if (!serverId || !channelId || !messageId) {
      throw new BadRequestException();
    }

    const server = await this.prisma.server.findFirst({
      where: {
        id: serverId,
        members: {
          some: {
            profileId: profile.id,
          },
        },
      },
      include: {
        members: true,
      },
    });

    if (!server) {
      throw new NotFoundException();
    }

    const channel = await this.prisma.channel.findFirst({
      where: {
        id: channelId,
        serverId: server.id,
      },
    });

    if (!channel) {
      throw new NotFoundException();
    }

    const member = server.members.find(
      (member) => member.profileId === profile.id,
    );

    if (!member) {
      throw new UnauthorizedException();
    }

    let message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        channelId: channel.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      throw new NotFoundException();
    }

    const isMessageOwner = message.member.profile.id === profile.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canDeleteMessage = isMessageOwner || isAdmin || isModerator;

    if (!canDeleteMessage) {
      throw new UnauthorizedException();
    }

    if (message.imageUrl && message.imagePublicId) {
      await this.cloudinaryService.deleteFile(message.imagePublicId);
    }

    message = await this.prisma.message.update({
      where: {
        id: message.id,
      },
      data: {
        deleted: true,
        imageUrl: null,
        imagePublicId: null,
        content: 'This message has been deleted.',
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const deleteKey = `chat:${channelId}:messages:delete`;

    return { deleteKey, message };
  }

  async deleteDirectMessage(
    userId: string,
    messageId: string,
    conversationId: string,
  ) {
    const profile = await this.getProfile(userId);

    if (!conversationId || !messageId) {
      throw new BadRequestException();
    }

    const conversation = await this.prisma.conversation.findFirst({
      where: {
        id: conversationId,
        OR: [
          {
            memberOne: {
              profileId: profile.id,
            }
          },
          {
            memberTwo: {
              profileId: profile.id,
            }
          }
        ],
      },
      include: {
        memberOne: {
          include: {
            profile: true,
          }
        },
        memberTwo: {
          include: {
            profile: true,
          }
        }
      }
    });

    if (!conversation) {
      throw new NotFoundException();
    }

    const member = conversation.memberOne.profile.id === profile.id ? conversation.memberOne : conversation.memberTwo;

    if (!member) {
      throw new UnauthorizedException();
    }

    let message = await this.prisma.directMessage.findFirst({
      where: {
        id: messageId,
        conversationId: conversation.id,
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    if (!message || message.deleted) {
      throw new NotFoundException();
    }

    const isMessageOwner = message.member.profile.id === profile.id;
    const isAdmin = member.role === MemberRole.ADMIN;
    const isModerator = member.role === MemberRole.MODERATOR;
    const canDeleteMessage = isMessageOwner || isAdmin || isModerator;

    if (!canDeleteMessage) {
      throw new UnauthorizedException();
    }

    if (message.imageUrl && message.imagePublicId) {
      await this.cloudinaryService.deleteFile(message.imagePublicId);
    }

    message = await this.prisma.directMessage.update({
      where: {
        id: message.id,
      },
      data: {
        deleted: true,
        imageUrl: null,
        imagePublicId: null,
        content: 'This message has been deleted.',
      },
      include: {
        member: {
          include: {
            profile: true,
          },
        },
      },
    });

    const deleteKey = `chat:${conversationId}:messages:delete`;

    return { deleteKey, message };
  }
}
