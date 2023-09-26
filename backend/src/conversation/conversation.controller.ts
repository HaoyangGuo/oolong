import {
  Controller,
  Post,
  Req,
} from '@nestjs/common';
import { ConversationService } from './conversation.service';
import { Request } from 'express';

@Controller('conversations')
export class ConversationController {
  constructor(private conversationService: ConversationService) {}


  @Post("initiate")
  async initiateConversation(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const { memberOneId, memberTwoId } = request.body;
    return await this.conversationService.initiateConversation(userId, memberOneId, memberTwoId);
  }
}
