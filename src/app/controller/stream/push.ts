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
import { StreamPushDTO, BroadcasterStopDTO } from '../../dto/stream/push';

import { AdminRoleService } from '../../service/admin/role';
import { AdminPermissionService } from '../../service/admin/permission';

@Provide()
@Controller('/stream', {
  tagName: 'RTC 数据流管理',
  description: '包含 RTC 数据流的推送和拉取',
})
export class StreamPushController {
  @Inject('streamPushService')
  streamPushService: StreamPushService;

  @App()
  private _app!: Application;

  @Inject('adminRoleService')
  roleService: AdminRoleService;

  @Inject('adminPermissionService')
  permissionService: AdminPermissionService;


  @Post('/push', {
    summary: '将外部流推送到到房间',
    description: '',
  })
  @Validate()
  async pullStreamAndPushToRooms(ctx: Context, @Body(ALL) params: StreamPushDTO) {
    const streamSrc = await this.streamPushService.getDhStreamSrc();
    const data = await this.streamPushService.startStreamPush({ ...params, streamSrc });
    ctx.helper.success(data);
  }

  @Post('/push/open', {
    summary: 'Open the channel for stream push',
    description: '',
  })
  @Validate()
  async openStreamPushChannel(ctx: Context, @Body(ALL) params: StreamPushDTO) {
    const streamSrc = await this.streamPushService.getDhStreamSrc();
    const data = await this.streamPushService.openStreamPush({ ...params, streamSrc });
    ctx.helper.success(data);
  }

  @Post('/push/stop', {
    summary: '停止推送数字人',
    description: '',
  })
  @Validate()
  async stopStreamPush(ctx: Context, @Body(ALL) params: BroadcasterStopDTO) {
    const serverHttp = "https://cosmoserver.tk:4443/stream/push/stop"
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

}
