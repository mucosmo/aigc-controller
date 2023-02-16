import {
  Controller,
  Provide,
  ALL,
  Del,
  Validate,
  Body,
  App
} from '@midwayjs/decorator';

import { Application, Context } from '@/interface';



@Provide()
@Controller('/stream/session', {
  tagName: 'RTC 数据流管理',
  description: '包含 RTC 数据流的推送和拉取',
})
export class StreamSessionController {
  @App()
  private _app!: Application;

  @Del('/end', {
    summary: '结束会话',
    description: '停止直播流，停止数字人推送等',
  })
  @Validate()
  async liveStreamUrl(ctx: Context, @Body(ALL) sessionId: string) {
    const serverHttp = "https://cosmoserver.tk:4443/stream/session/end"
    const result = await this._app.curl(serverHttp, {
      method: 'DELETE',
      data: sessionId,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    ctx.helper.success(result.data);
  }

}
