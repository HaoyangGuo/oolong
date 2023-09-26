import {
  Controller,
  Get,
  Post,
  Req,
} from '@nestjs/common';
import { LivekitService } from './livekit.service';
import { Request } from 'express';

@Controller('livekits')
export class LivekitController {
  constructor(private livekitService: LivekitService) {}

  @Get(":roomId")
  async getRoomToken(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const { roomId } = request.params;
    return await this.livekitService.getRoomToken(userId, roomId);
  };
}
