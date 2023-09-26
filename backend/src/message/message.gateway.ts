import {
  OnGatewayInit,
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { CloudinaryService } from 'src/cloudinary/cloudinary.service';
import { PrismaService } from 'src/db/prisma.service';
import { MessageService } from './message.service';
import { Server, Socket } from 'socket.io';
import * as jwt from 'jsonwebtoken';
import * as jwksRsa from 'jwks-rsa';
import { Injectable } from '@nestjs/common';
import { DirectMessage, Message } from '@prisma/client';

@Injectable()
@WebSocketGateway({
  cors: true,
  namespace: 'socket',
})
export class MessageGateway implements OnGatewayInit, OnGatewayConnection {
  constructor(
    private readonly MessageService: MessageService,
    private readonly prisma: PrismaService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @WebSocketServer() server: Server;

  private jwksClient = jwksRsa({
    jwksUri: `${process.env.AUTH0_ISSUER_BASE_URL}/.well-known/jwks.json`,
  });

  private getKey = (header, callback) => {
    this.jwksClient.getSigningKey(header.kid, (err, key) => {
      if (err) {
        callback(err, null);
        return;
      }
      // @ts-ignore
      const signingKey = key.publicKey || key.rsaPublicKey;
      callback(null, signingKey);
    });
  };

  async verifyToken(token: string) {
    return new Promise((resolve, reject) => {
      jwt.verify(
        token,
        this.getKey,
        {
          algorithms: ['RS256'],
        },
        (err, decoded) => {
          if (err) {
            reject(err);
            return;
          }
          resolve(decoded);
        },
      );
    });
  }

  async handleConnection(client: Socket) {
    if (!client.handshake.headers.authorization) {
      client.disconnect();
      return;
    }
    const accessToken = client.handshake.headers.authorization.split(' ')[1];
    try {
      const decoded = (await this.verifyToken(accessToken)) as any;
      const profile = await this.prisma.profile.findUnique({
        where: {
          userId: decoded.sub,
        },
      });
      if (!profile) {
        client.disconnect();
        return;
      }
      // client.userId = decoded.sub;
    } catch (error) {
      client.disconnect();
    }
  }

  afterInit() {
    console.log('MessageGateway Init');
  }

  pushMessage(chennelKey: string, message: Message | DirectMessage) {
    this.server.emit(chennelKey, message);
  }

  deleteMessage(deleteKey: string, messageId: Message | DirectMessage) {
    this.server.emit(deleteKey, messageId);
  }
}
