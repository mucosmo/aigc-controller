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

import { AdminUserService } from '../../service/admin/user';
import {
  StreamPushDTO,
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
    const { stream } = params;
    ctx.helper.success(stream);
  }

}
