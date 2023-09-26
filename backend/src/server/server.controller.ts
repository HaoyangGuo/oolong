import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Req,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ServerService } from './server.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';

@Controller('servers')
export class ServerController {
  constructor(private serverService: ServerService) {}

  @Get()
  async servers(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    return await this.serverService.servers(userId);
  }

  @Get('default')
  async defaultServer(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    return await this.serverService.defaultServer(userId);
  }

  @Get(':serverId')
  async server(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    return await this.serverService.server(userId, serverId);
  }

  @Patch(':serverId')
  @UseInterceptors(FileInterceptor('image'))
  async updateServer(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File | undefined,
  ) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    const { name } = request.body;
    return await this.serverService.updateServer(userId, serverId, name, file);
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  async createServer(
    @Req() request: Request,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const userId = request.auth.payload.sub;
    const { name } = request.body;
    return await this.serverService.createServer(userId, name, file);
  }

  @Patch('join/:inviteCode')
  async joinServer(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const inviteCode = request.params.inviteCode;
    return await this.serverService.joinServer(userId, inviteCode);
  }

  @Patch(':serverId/invite-code')
  async updateServerInviteCode(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    return await this.serverService.updateServerInviteCode(userId, serverId);
  }

  @Patch(':serverId/members/:memberId/role')
  async updateMemberRole(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    const memberId = request.params.memberId;
    const { role } = request.body;
    return await this.serverService.updateMemberRole(
      userId,
      serverId,
      memberId,
      role,
    );
  }

  @Delete(':serverId')
  async deleteServer(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    return await this.serverService.deleteServer(userId, serverId);
  }

  @Delete(':serverId/members/me')
  async leaveServer(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const { serverId } = request.params;
    return await this.serverService.leaveServer(userId, serverId);
  }

  @Delete(':serverId/members/:memberId')
  async removeMember(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    const memberId = request.params.memberId;
    return await this.serverService.removeMember(userId, serverId, memberId);
  }

  @Delete(':serverId/channels/:channelId')
  async deleteChannel(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    const channelId = request.params.channelId;
    return await this.serverService.deleteChannel(userId, serverId, channelId);
  }

  @Patch(':serverId/channels/:channelId')
  async updateChannel(@Req() request: Request) {
    const userId = request.auth.payload.sub;
    const serverId = request.params.serverId;
    const channelId = request.params.channelId;
    const { name, type } = request.body;
    return await this.serverService.updateChannel(
      userId,
      serverId,
      channelId,
      name,
      type,
    );
  }
}
