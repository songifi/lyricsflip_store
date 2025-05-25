import { Controller, Get, Param, Res, Header } from "@nestjs/common"
import type { Response } from "express"
import type { RssService } from "../services/rss.service"

@Controller("podcasts")
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get(":id/rss")
  @Header("Content-Type", "application/rss+xml; charset=utf-8")
  async getRssFeed(@Param('id') podcastId: string, @Res() res: Response) {
    const rssFeed = await this.rssService.generateRssFeed(podcastId)
    res.send(rssFeed)
  }
}
