import {
  BadRequestException,
  Injectable,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common';
import { Profile } from '@prisma/client';
import { PrismaService } from 'src/db/prisma.service';
import { AccessToken } from 'livekit-server-sdk';

@Injectable()
export class LivekitService implements OnModuleInit {
  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    // cloudinary.config({
    //   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    //   api_key: process.env.CLOUDINARY_API_KEY,
    //   api_secret: process.env.CLOUDINARY_API_SECRET,
    // });
  }

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

  async getRoomToken(userId: string, roomId: string) {
    const profile = await this.getProfile(userId);

    if (!roomId) {
      throw new BadRequestException('Room ID is required');
    }

    const apiKey = process.env.LIVEKIT_API_KEY;
    const apiSecret = process.env.LIVEKIT_API_SECRET;

    const at = new AccessToken(apiKey, apiSecret, {
      identity: userId,
      name: profile.username,
    });

    at.addGrant({
      roomJoin: true,
      canPublish: true,
      canSubscribe: true,
    });

    return { token: at.toJwt() };
  }
}
