import {
  Controller,
  Provide,
  Inject,
  ALL,
  Post,
  Body,
} from '@midwayjs/decorator';

import { Context } from '@/interface';
import { RenderService } from '../../service/render/render';
import { AdminRoleService } from '../../service/admin/role';
import { AdminPermissionService } from '../../service/admin/permission';

@Provide()
@Controller('/render', {
  tagName: 'ffmpeg 渲染控制器',
  description: '',
})
export class RenderController {
  @Inject('renderService')
  service: RenderService;

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
      const result = await this.service.initTemplate(params);
      ctx.helper.success(result);
    } catch (error) {
      ctx.helper.success(error.toString(), 'failed to init template', 500);
    }
  }

  @Post('/src', {
    summary: '初始化数据源',
    description: '',
  })
  async initSrc(ctx: Context, @Body(ALL) params: any) {
  }


  @Post('/region/src', {
    summary: '数据源映射到模板区域',
    description: '',
  })
  async srcMap2Region(ctx: Context, @Body(ALL) params: any) {
    try {
      const result = await this.service.src2Region(params);
      ctx.helper.success(result);
    } catch (error) {
      ctx.helper.success(error.toString(), 'failed to map src to region', 500);
    }
  }

  //模板区域的空间控制
  @Post('/region/space', {
    summary: '模板区域的空间控制',
    description: '',
  })
  async regionSpaceChange(ctx: Context, @Body(ALL) params: any) {
    try {
      const result = await this.service.regionSpaceChange(params);
      ctx.helper.success(result);
    } catch (error) {
      console.log(error);
      ctx.helper.success(error, error, 500);
    }
  }


  @Post('/region/filter', {
    summary: '给模板区域初始化滤波器',
    description: '',
  })
  initFilters(ctx: Context, @Body(ALL) params: any) {

  }

  //更新模板区域的滤波器
  @Post('/filter/update', {
    summary: '更新滤波器参数',
    description: '',
  })
  async updateRegionFilter(ctx: Context, @Body(ALL) params: any) {
    try {
      const result = await this.service.updateRegionFilterParams(params);
      ctx.helper.success(result);
    } catch (error) {
      ctx.helper.success(error.toString(), "failed to update filter", 500);
    }
  }
}
