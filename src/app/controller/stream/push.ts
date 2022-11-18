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
  StreamPushDTO, StreamPullDTO, StreamLiveDTO
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
    summary: '推送音频流到 ASR',
    description: '房间，用户，文件和音频格式',
  })
  @Validate()
  async pushStreamToASR(ctx: Context, @Body(ALL) params: StreamPushDTO) {
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


  @Post('/pull', {
    summary: '拉流并推送到房间',
    description: '',
  })
  @Validate()
  async pullStreamAndPushToRooms(ctx: Context, @Body(ALL) params: StreamPullDTO) {
    try {
      // 生成数字人形象
      const sessionId = `tx_${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
      const body1 = {
        sessionId: sessionId,
        templateId: 5,
        protocol: "rtmp" // valid('rtsp','rtmp','flv')
      }
      const serverHttp1 = "http://hz-test.ikandy.cn:60004/init/resource"
      const result1 = await this._app.curl(serverHttp1, {
        method: 'POST',
        data: body1,
        dataType: 'json',
        headers: {
          'content-type': 'application/json',
        },
      });

      // 为数字人添加朗读文本
      const body2 = {
        sessionId: sessionId,
        text: params.text,
      }
      const serverHttp2 = "http://hz-test.ikandy.cn:60004/text/render"
      await this._app.curl(serverHttp2, {
        method: 'POST',
        data: body2,
        dataType: 'json',
        headers: {
          'content-type': 'application/json',
        },
      });

      // 将流地址和要播放的房间号传给 mediasoup 服务器
      const body3 = {
        room: params.room,
        streamAddr: result1.data.data.addr
      }
      const serverHttp3 = "https://hz-test.ikandy.cn:4443/stream/pull"
      const result3 = await this._app.curl(serverHttp3, {
        method: 'POST',
        data: body3,
        dataType: 'json',
        headers: {
          'content-type': 'application/json',
        },
      });
      result3.data["sessionId"] = sessionId

      ctx.helper.success(result3.data);
    } catch (error) {
      ctx.helper.success(error, '服务器内部错误', 500);
    }
  }


  @Post('/push/live', {
    summary: '拉流并推送到房间',
    description: '',
  })
  @Validate()
  async liveStreamUrl(ctx: Context, @Body(ALL) params: StreamLiveDTO) {
    try {
      // 发送给 mediasoup 服务器，生成某用户的直播流地址
      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/push/live"
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
