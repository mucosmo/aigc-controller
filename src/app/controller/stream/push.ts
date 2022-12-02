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
  StreamPushDTO, StreamPullDTO, StreamLiveDTO, SessionStopDTO
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

  @Post('/pull/dm', {
    summary: '拉取音频流用于会话管理',
    description: '',
  })
  @Validate()
  async pushStreamToASR(ctx: Context, @Body(ALL) params: StreamPullDTO) {
    try {
      // 发送给 mediasoup 服务器，控制其音视频流
      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/pull/dm"
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


  @Post('/pull/live', {
    summary: '从房间拉流并生成直播地址',
    description: '',
  })
  @Validate()
  async liveStreamUrl(ctx: Context, @Body(ALL) params: StreamLiveDTO) {
    try {
      // 发送给 mediasoup 服务器，生成某用户的直播流地址
      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/pull/live"
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
      ctx.helper.success({ liveUrl: 'http://devimages.apple.com/iphone/samples/bipbop/gear4/prog_index.m3u8' });

      // ctx.helper.success(error, '服务器内部错误', 500);
    }
  }

  @Post('/pull', {
    summary: '从房间拉流并生成直播地址',
    description: '',
  })
  // @Validate()
  async pullStream(ctx: Context, @Body(ALL) params: StreamPullDTO) {
    try {

      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/pull"
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

  @Post('/push', {
    summary: '将外部流推送到到房间',
    description: '',
  })
  @Validate()
  async pullStreamAndPushToRooms(ctx: Context, @Body(ALL) params: StreamPushDTO) {
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
      const serverHttp3 = "https://hz-test.ikandy.cn:4443/stream/push"
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


  @Post('/render', {
    summary: '流合成渲染',
    description: '',
  })
  // @Validate()
  async streamRender(ctx: Context, @Body(ALL) params: { text: string }) {
    try {
      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/render"
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

  @Post('/session/stop', {
    summary: '停止会话',
    description: '',
  })
  @Validate()
  async stopStreamPush(ctx: Context, @Body(ALL) params: SessionStopDTO) {
    try {
      const serverHttp = "https://hz-test.ikandy.cn:4443/stream/session/stop"
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
