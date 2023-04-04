import {CACHE_MANAGER, Controller, Get, Inject, Post, Query} from "@nestjs/common";
import { AppService } from "./app.service";
import {Cache} from "cache-manager";

interface IQuery {
  success: boolean;
  message: string;
}
@Controller()
export class AppController {
  constructor(
      @Inject(CACHE_MANAGER) private cacheManager: Cache,
      private readonly appService: AppService
  ) { }

  @Post("api/sendSHM")
  async sendSHM(@Query("address") _address: string): Promise<IQuery> {
    try {
      const status: "requested" | "sent" = await this.cacheManager.get(_address?.toLowerCase())

      if(status !== 'sent') {
        await this.cacheManager.set(_address?.toLowerCase(), "requested", {ttl: 30});
      }

      if (status === 'sent') {
        return {
          success: false,
          message: "Please wait for 12 hours to claim again",
        };
      }
      if(status !== 'requested') {
        const res = await this.appService.sendSHM(_address);
        if(res?.success) await this.cacheManager.set(_address?.toLowerCase(), "sent");
        if(!res?.success) await this.cacheManager.del(_address?.toLowerCase());
        return res
      }
      return {success: false, message: "Your previous request is still in progress. Try again in 30 seconds"};
    } catch (e) {
      await this.cacheManager.del(_address?.toLowerCase());
      console.error(e?.message)
      return {success: false, message: "Something went wrong. Try again"};
    }
  }

  @Post("api/validate")
  async validate(@Query("token") token: string): Promise<IQuery> {
    return this.appService.validateCaptcha(token)
  }
  @Get("api/balance")
  async getFaucetBalance(@Query("address") _address: string): Promise<any> {
    return this.appService.getFaucetBalance(_address)
  }
}
