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


import { AdminUserService } from '../../service/admin/user';
import {
  StreamPushDTO
} from '../../dto/stream/push';

import { AdminRoleService } from '../../service/admin/role';
import { AdminPermissionService } from '../../service/admin/permission';

@Provide()
@Controller('/stream', {
  tagName: 'RTC 数据流管理',
  description: '包含 RTC 数据流的推送和拉取',
})
export class StreamPushController {
  @Inject('adminUserService')
  service: AdminUserService;

  @App()
  private _app!: Application;

  @Inject('adminRoleService')
  roleService: AdminRoleService;

  @Inject('adminPermissionService')
  permissionService: AdminPermissionService;

  @Post('/push', {
    summary: '管理流推送',
    description: '房间，用户，文件和音频格式',
  })
  @Validate()
  async query(ctx: Context, @Body(ALL) params: StreamPushDTO) {
    console.log(params);
    try {
      // 发送给 mediasoup 服务器，控制其音视频流
      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/push"
      const result = await this._app.curl(serverHttp, {
        method: 'POST',
        data: params,
        dataType: 'json',
        headers: {
          'content-type': 'application/json',
        },
      });
      ctx.helper.success(result.data);
    } catch (error) {
      ctx.helper.success(error, '服务器内部错误', 500);
    }
  }
}
