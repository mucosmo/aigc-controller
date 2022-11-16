import {
  Controller,
  Provide,
  Inject,
  ALL,
  Post,
  Validate,
  Body,
  App,
  Get,
  Query
} from '@midwayjs/decorator';

import { Application, Context } from '@/interface';


import { AdminUserService } from '../../service/admin/user';
import {
  StreamPushDTO, ShowDTO
} from '../../dto/stream/push';

import { AdminRoleService } from '../../service/admin/role';
import { AdminPermissionService } from '../../service/admin/permission';

@Provide()
@Controller('/stream', {
  tagName: '管理员管理',
  description: '包含管理员的增、删、改、查',
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

console.log('--------------- stream/push ---------')
console.log(params)
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
      ctx.helper.success(params);

    }




  }

  @Get('/show', {
    summary: '获取单个管理员详情',
    description: '获取管理员的详细信息，包括其关联的对象',
  })
  @Validate()
  async show(ctx: Context, @Query(ALL) query: ShowDTO) {
 
    ctx.helper.success(query);
  }

}
