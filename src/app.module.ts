import { Module, CacheModule } from '@nestjs/common';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {redisStore} from 'cache-manager-redis-store';

@Module({
  imports: [CacheModule.register({
    store: redisStore as any,
    url: 'redis://skaarj:S32069257b!@redis-16445.c11.us-east-1-2.ec2.cloud.redislabs.com:16445',
    isGlobal: true
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
