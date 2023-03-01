import {
  Controller,
  Provide,
  Inject,
  ALL,
  Post,
  Validate,
  Body,
} from '@midwayjs/decorator';

import { Context } from '@/interface';


import { StreamPushService } from '../../service/stream/push';
import { StreamPushDTO } from '../../dto/stream/push';
import { CreateDhDTO } from '../../dto/stream/dh';
import { DigitalHumanService } from '../../service/stream/dh';


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

  @Inject('digitalHumanService')
  digitalHumanService: DigitalHumanService;

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
    const dh = params.dh as CreateDhDTO & { text: string };
    const { addr: streamSrc, topic } = await this.digitalHumanService.createDh(dh);
    await this.digitalHumanService.driveDh({ topic, text: dh.text });
    const data = await this.streamPushService.startStreamPush({ ...params, streamSrc });
    ctx.helper.success({ ...data, topic });
  }

  @Post('/push/open', {
    summary: 'Open the channel for stream push',
    description: '',
  })
  @Validate()
  async openStreamPushChannel(ctx: Context, @Body(ALL) params: StreamPushDTO) {
    const data = await this.streamPushService.openStreamPush(params);
    ctx.helper.success(data);
  }

}
