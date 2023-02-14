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
      const result = await this.service.initTemplate(params);
      ctx.helper.success(result);
  }

  @Post('/template/update', {
    summary: '合成器实例的更新',
    description: '',
  })
  // @Validate()
  async updateTemplate(ctx: Context, @Body(ALL) params: any) {
      const result = await this.service.updateTemplate(params);
      ctx.helper.success(result);
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
      const result = await this.service.src2Region(params);
      ctx.helper.success(result);
  }

  //模板区域的空间控制
  @Post('/region/space', {
    summary: '模板区域的空间控制',
    description: '',
  })
  async regionSpaceChange(ctx: Context, @Body(ALL) params: any) {
      const result = await this.service.regionSpaceChange(params);
      ctx.helper.success(result);
  }


  @Post('/region/filter', {
    summary: '给模板区域增减滤波器',
    description: '',
  })
  async addDeleteFilters(ctx: Context, @Body(ALL) params: any) {
      const result = await this.service.addDeleteRegionFilters(params);
      ctx.helper.success(result);
  }

  //更新模板区域的滤波器
  @Post('/filter/update', {
    summary: '更新滤波器参数',
    description: '',
  })
  async updateRegionFilter(ctx: Context, @Body(ALL) params: any) {
      const result = await this.service.updateRegionFilterParams(params);
      ctx.helper.success(result);
  }
}
