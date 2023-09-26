import { MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { auth } from 'express-oauth2-jwt-bearer';
import { ProfileModule } from './profile/profile.module';
import { ServerModule } from './server/server.module';
import { ChannelModule } from './channel/channel.module';
import { ConversationModule } from './conversation/conversation.module';
import { MemberModule } from './member/member.module';
import { MessageModule } from './message/message.module';
import { LivekitModule } from './livekit/livekit.module';

@Module({
  imports: [
    ProfileModule,
    ServerModule,
    ChannelModule,
    ConversationModule,
    MemberModule,
    MessageModule,
    LivekitModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply the auth middleware to all routes
    consumer
      .apply(
        auth({
          issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
          audience: process.env.AUTH0_AUDIENCE,
          tokenSigningAlg: 'RS256',
        }),
      )
      .forRoutes({
        path: '*',
        method: RequestMethod.ALL,
      });
  }
}
