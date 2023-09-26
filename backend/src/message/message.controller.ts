import {
  Controller,
  Get,
  Post,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
  Query,
} from '@nestjs/common';
import { MessageService } from './message.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { MessageGateway } from './message.gateway';

@Controller('messages')
export class MessageController {
  constructor(
    private messageService: MessageService,
    private messageGateway: MessageGateway,
  ) {}

  @Get()
  async getMessages(
    @Req() request: Request,
    @Query('channelId') channelId: string,
    @Query('cursor') cursor: string,
  ) {
    const userId = request.auth.payload.sub;
    return await this.messageService.getMessages(userId, channelId, cursor);
  }

  @Get("direct")
  async getDirectMessages(
    @Req() request: Request,
    @Query("conversationId") conversationId: string,
    @Query("cursor") cursor: string,
  ) {
    const userId = request.auth.payload.sub;
    return await this.messageService.getDirectMessages(userId, conversationId, cursor);
  }

  @Post()
  @UseInterceptors(FileInterceptor('image'))
  async createMessage(
    @Req() request: Request,
    @UploadedFile() image: Express.Multer.File,
    @Query('serverId') serverId: string,
    @Query('channelId') channelId: string,
  ) {
    const userId = request.auth.payload.sub;
    const { content } = request.body;
    const { channelKey, message } = await this.messageService.createMessage(
      userId,
      serverId,
      channelId,
      content,
      image,
    );
    this.messageGateway.pushMessage(channelKey, message);
    return message;
  }

  @Post("direct")
  @UseInterceptors(FileInterceptor('image'))
  async createDirectMessage(
    @Req() request: Request,
    @UploadedFile() image: Express.Multer.File,
    @Query("conversationId") conversationId: string,
  ) {
    const userId = request.auth.payload.sub;
    const { content } = request.body;
    const { channelKey, message } = await this.messageService.createDirectMessage(
      userId,
      conversationId,
      content,
      image,
    );
    this.messageGateway.pushMessage(channelKey, message);
    return message;
  }



  @Delete(':messageId')
  async deleteMessage(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const { serverId, channelId } = request.body;
    const { messageId } = request.params;
    const { deleteKey, message } = await this.messageService.deleteMessage(
      userId,
      messageId,
      serverId,
      channelId,
    );
    this.messageGateway.deleteMessage(deleteKey, message);
    return message;
  }

  @Delete("direct/:messageId")
  async deleteDirectMessage(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const { conversationId } = request.body;
    const { messageId } = request.params;
    const { deleteKey, message } = await this.messageService.deleteDirectMessage(
      userId,
      messageId,
      conversationId,
    );
    this.messageGateway.deleteMessage(deleteKey, message);
    return message;
  }
}
