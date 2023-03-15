import {CACHE_MANAGER, Controller, Inject, Post, Query} from "@nestjs/common";
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

  @Post("sendSHM")
  async sendSHM(@Query("address") _address: string): Promise<IQuery> {
    try {
      const hasAddressInCache = await this.cacheManager.get(_address?.toLowerCase())
      if (hasAddressInCache) {
        return {
          success: false,
          message: "Please wait for 12 hours to claim again",
        };
      }
      const res = await this.appService.sendSHM(_address);
      if(res?.success) await this.cacheManager.set(_address?.toLowerCase(), true);
      return res
    } catch (e) {
      return {success: false, message: "Something went wrong. Try again"};
    }
  }
}
