import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { ChannelService } from './channel.service';

@Controller('channels')
export class ChannelController {
  constructor(private channelService: ChannelService) {}

  @Get()
  async channel(
    @Query('channelId') channelId: string,
    @Query('serverId') serverId: string,
    @Req() request: Request,
  ) {
    const userId = request.auth.payload.sub;
    return await this.channelService.getChannel(userId, serverId, channelId);
  }

  @Post(':serverId')
  async createChannel(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const { serverId } = request.params;
    const { name, type } = request.body;
    return await this.channelService.createChannel(
      userId,
      name,
      type,
      serverId,
    );
  }
}
