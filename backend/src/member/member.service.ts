import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { ChannelType, MemberRole, Profile, Member } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { UnauthorizedException } from '@nestjs/common';

@Injectable()
export class MemberService {
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

  async getCurrentMember(userId: string, serverId: string) {
    const profile = await this.getProfile(userId);
    if (!serverId) {
      throw new BadRequestException();
    }

    const member = await this.prisma.member.findFirst({
      where: {
        serverId,
        profileId: profile.id,
      },
    });

    if (!member) {
      throw new UnauthorizedException();
    }
    return member;
  }
}
