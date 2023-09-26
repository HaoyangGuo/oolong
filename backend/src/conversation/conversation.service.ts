import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChannelType, MemberRole, Profile, Conversation } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class ConversationService {
  constructor(
    private readonly prisma: PrismaService,
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

  private async findConversation(memberOneId: string, memberTwoId: string) {
    try {
      return await this.prisma.conversation.findFirst({
        where: {
          AND: [{ memberOneId }, { memberTwoId }],
        },
        include: {
          memberOne: {
            include: {
              profile: true,
            },
          },
          memberTwo: {
            include: {
              profile: true,
            },
          },
        },
      });
    } catch (err) {
      return null;
    }
  }

  private async createNewConversation(
    memberOneId: string,
    memberTwoId: string,
  ) {
    try {
      return await this.prisma.conversation.create({
        data: {
          memberOneId,
          memberTwoId,
        },
        include: {
          memberOne: {
            include: {
              profile: true,
            },
          },
          memberTwo: {
            include: {
              profile: true,
            },
          },
        },
      });
    } catch (err) {
      return null;
    }
  }

  public async initiateConversation(
    userId: string,
    memberOneId: string,
    memberTwoId: string,
  ) {
    const profile = await this.getProfile(userId);

    let conversation =
      (await this.findConversation(memberOneId, memberTwoId)) ||
      (await this.findConversation(memberTwoId, memberOneId));

    if (conversation === null) {
      conversation = await this.createNewConversation(memberOneId, memberTwoId);
    }

    return conversation;
  }
}
