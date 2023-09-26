import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from 'src/db/prisma.service';
import { Profile } from '@prisma/client';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';

@Injectable()
export class ProfileService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  async profile(userId: string): Promise<Profile> {
    const profile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (profile) {
      return profile;
    }

    return await this.prisma.profile.create({
      data: {
        userId,
        username: `user#${userId.slice(-4)}`,
        imageUrl: `placeholder#${userId}`,
        imagePublicId: `placeholder#${userId}`,
      },
    });
  }

  async updateProfile(
    userId: string,
    userName: string | undefined,
    image: Express.Multer.File | undefined,
  ): Promise<Profile> {
    const existingProfile = await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });

    if (!existingProfile) {
      throw new UnauthorizedException();
    }

    const updateData: Partial<Profile> = {};

    if (image) {
      if (!existingProfile.imagePublicId.startsWith('placeholder#')) {
        this.cloudinaryService.deleteFile(existingProfile.imagePublicId);
      }

      const { public_id: imagePublicId, secure_url: imageUrl } =
        await this.cloudinaryService.uploadFile(image);

      updateData.imagePublicId = imagePublicId;
      updateData.imageUrl = imageUrl;
    }

    if (userName) {
      updateData.username = userName;
    }

    if (Object.keys(updateData).length) {
      await this.prisma.profile.update({
        where: {
          userId,
        },
        data: updateData,
      });
    }

    return await this.prisma.profile.findUnique({
      where: {
        userId,
      },
    });
  }
}
