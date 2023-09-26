import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  Param,
  Query,
} from '@nestjs/common';
import { MemberService } from './member.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('members')
export class MemberController {
  constructor(private MemberService: MemberService) {}

  @Get('current')
  async getCurrentMember(
    @Req() request: Request,
    @Query('serverId') serverId: string,
  ) {
    const userId = request.auth.payload.sub;
    return await this.MemberService.getCurrentMember(userId, serverId);
  }
}
