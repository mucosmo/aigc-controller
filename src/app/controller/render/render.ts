import {
  Controller,
  Provide,
  Inject,
  ALL,
  Post,
  Body,
  App
} from '@midwayjs/decorator';

import { Application, Context } from '@/interface';


import { RenderService } from '../../service/render/render';


import { AdminRoleService } from '../../service/admin/role';
import { AdminPermissionService } from '../../service/admin/permission';

@Provide()
@Controller('/render', {
  tagName: 'ffmpeg 渲染控制器',
  description: '',
})
export class RenderController {
  @Inject('streamPushService')
  service: RenderService;

  @App()
  private _app!: Application;

  @Inject('adminRoleService')
  roleService: AdminRoleService;

  @Inject('adminPermissionService')
  permissionService: AdminPermissionService;



  @Post('/template', {
    summary: '初始化模板',
    description: '',
  })
  // @Validate()
  async initTemplate(ctx: Context, @Body(ALL) params: any) {
    try {

      const filterStr = this.service.avFilterGraph(params);
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
    } catch (error) {
      ctx.helper.success(error, '服务器内部错误', 500);
    }
  }

  @Post('/src', {
    summary: '初始化数据源',
    description: '',
  })
  initSrc(params: any) {

  }


  @Post('/template/src', {
    summary: '数据源映射到模板区域',
    description: '',
  })
  srcMap2Template(params: any) {

  }

  //模板区域的空间控制
  @Post('/template/space', {
    summary: '模板区域的空间控制',
    description: '',
  })
  templateSpaceChange(params: any) {

  }


  @Post('/template/filter', {
    summary: '给模板区域初始化滤波器',
    description: '',
  })
  initFilters(params: any) {

  }

  //更新模板区域的滤波器
  @Post('/template/filter/update', {
    summary: '给模板区域初始化滤波器',
    description: '',
  })
  updateRegionFilter(params: any) {

  }



}
