import { Module, CacheModule } from '@nestjs/common';
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import * as redisStore from 'cache-manager-redis-store';

// eslint-disable-next-line @typescript-eslint/no-var-requires
require("dotenv").config();

@Module({
  imports: [CacheModule.register({
    store: redisStore as any,
    url: process.env.REDIS_URL,
    isGlobal: true,
    ttl: 43200
  })],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
