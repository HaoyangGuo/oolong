import { Module } from '@nestjs/common';
import { LivekitController } from './livekit.controller';
import { LivekitService } from './livekit.service';
import { PrismaService } from 'src/db/prisma.service';

@Module({
  controllers: [LivekitController],
  providers: [LivekitService, PrismaService],
})
export class LivekitModule {}
