import { Module, CacheModule } from '@nestjs/common';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {redisStore} from 'cache-manager-redis-store';

@Module({
  imports: [CacheModule.register({
    store: redisStore as any,
    host: 'redis-16445.c11.us-east-1-2.ec2.cloud.redislabs.com',
    port: 16445
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
