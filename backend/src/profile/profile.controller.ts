import {
  Controller,
  Get,
  Patch,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ProfileService } from './profile.service';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('profiles')
export class ProfileController {
  constructor(private profileService: ProfileService) {}

  @Get()
  async profile(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    return await this.profileService.profile(userId);
  }

  @Patch()
  @UseInterceptors(FileInterceptor('image'))
  async updateProfile(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const userId = request.auth.payload.sub;
    const { username } = request.body;
    return await this.profileService.updateProfile(userId, username, file);
  }
}
