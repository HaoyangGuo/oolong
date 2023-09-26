import { Module } from '@nestjs/common';
import { MessageService } from './message.service';
import { MessageGateway } from './message.gateway';
import { PrismaService } from 'src/db/prisma.service';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { MessageController } from './message.controller';

@Module({
  controllers: [MessageController],
  providers: [MessageGateway, MessageService, PrismaService, CloudinaryService],
})
export class MessageModule {}
