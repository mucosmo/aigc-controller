import {
  Controller,
  Provide,
  Inject,
  ALL,
  Post,
  Validate,
  Body,
  App
} from '@midwayjs/decorator';

import { Application, Context } from '@/interface';


import { StreamPushService } from '../../service/stream/push';
import { StreamPullDTO, StreamLiveDTO } from '../../dto/stream/push';

import { AdminRoleService } from '../../service/admin/role';
import { AdminPermissionService } from '../../service/admin/permission';

@Provide()
@Controller('/stream', {
  tagName: 'RTC 数据流管理',
  description: '包含 RTC 数据流的推送和拉取',
})
export class StreamPullController {
  @Inject('streamPushService')
  streamPushService: StreamPushService;

  @App()
  private _app!: Application;

  @Inject('adminRoleService')
  roleService: AdminRoleService;

  @Inject('adminPermissionService')
  permissionService: AdminPermissionService;

  @Post('/pull/dm', {
    summary: '拉取音频流用于会话管理',
    description: '',
  })
  @Validate()
  async pushStreamToASR(ctx: Context, @Body(ALL) params: StreamPullDTO) {
    // 发送给 mediasoup 服务器，控制其音视频流
    const serverHttp = "https://cosmoserver.tk:4443/stream/pull/dm"
    const result = await this._app.curl(serverHttp, {
      method: 'POST',
      data: params,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    ctx.helper.success(result.data);
  }


  @Post('/pull/live', {
    summary: '从房间拉流并生成直播地址',
    description: '',
  })
  @Validate()
  async liveStreamUrl(ctx: Context, @Body(ALL) params: StreamLiveDTO) {
    // 发送给 mediasoup 服务器，生成某用户的直播流地址
    const serverHttp = "https://cosmoserver.tk:4443/stream/pull/live"
    const result = await this._app.curl(serverHttp, {
      method: 'POST',
      data: params,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    ctx.helper.success(result.data);
  }

  @Post('/pull', {
    summary: '从房间拉流并生成直播地址',
    description: '',
  })
  // @Validate()
  async pullStream(ctx: Context, @Body(ALL) params: StreamPullDTO) {
    const serverHttp = "https://cosmoserver.tk:4443/stream/pull"
    const result = await this._app.curl(serverHttp, {
      method: 'POST',
      data: params,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    ctx.helper.success(result.data);
  }

  @Post('/render', {
    summary: '流合成渲染',
    description: '',
  })
  // @Validate()
  async streamRender(ctx: Context, @Body(ALL) params: { text: string }) {
    const filterStr = this.streamPushService.avFilterGraph(params);
    const serverHttp = "https://cosmoserver.tk:4443/stream/render"
    const result = await this._app.curl(serverHttp, {
      method: 'POST',
      data: { text: filterStr },
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    ctx.helper.success({ result: result.data, filter: filterStr });
  }

}
