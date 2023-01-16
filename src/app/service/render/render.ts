
import { Provide, Inject, App } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';

import { Application, Context } from '@/interface';

import { AdminUserModel } from '../../model/admin-user';

/** 24小时的秒数，用于 redis 缓存 */
const TWENTYFOURHOURS = 24 * 60 * 60;


@Provide()
export class RenderService {
  @Inject()
  ctx: Context;

  @App()
  private _app!: Application;

  @InjectEntityModel(AdminUserModel)
  adminUserModel: Repository<AdminUserModel>;

  //初始化模板
  async initTemplate(params: any) {
    //区域不包含 drawtext 和 硬字幕 subtitles, 这两种作为 filter 在后面处理， 软字幕暂不处理
    const regions = params.template.regions.filter(item => ['video', 'audio', 'picture'].indexOf(item.type) > -1);
    const srcs = params.srcs;

    //初始化数据源
    regions.forEach(itemRegion => {
      const theSrc = srcs.find(src => src.id === itemRegion.srcId)
      itemRegion.src = theSrc;
    });

    //存储初始化后的模板
    const key = params.template.id;
    const template = params.template;
    await this.ctx.app.redis.set(key, JSON.stringify(template), 'EX', TWENTYFOURHOURS); // EX 秒，PX 毫秒

    //存储数据源，和 template 匹配
    await this.ctx.app.redis.set(key + "_srcs", JSON.stringify(params.srcs), 'EX', TWENTYFOURHOURS);



    const filterDesc = await this.__initFilterGraph(template); // 耗时小于 10 ms


    return filterDesc;
  }

  //数据源到模板区域的映射
  async src2Region(params: any) {
    const templateId = params.templateId;
    const template = JSON.parse(await this.ctx.app.redis.get(templateId));
    const srcs = await this.ctx.app.redis.get(templateId + "_srcs");

    params.regions.forEach(item => {
      const theRegion = template.regions.find(region => region.id === item.regionId);
      const theSrc = JSON.parse(srcs).find(src => src.id === item.srcId)
      theRegion.src = theSrc;
    });

    await this.ctx.app.redis.set(templateId, JSON.stringify(template), 'EX', TWENTYFOURHOURS);
    const filterDesc = await this.__initFilterGraph(template);

    return filterDesc;
  }



  //模板区域的空间控制
  async regionSpaceChange(params: any) {
    const templateId = params.templateId;
    const template = JSON.parse(await this.ctx.app.redis.get(templateId));

    params.regions.forEach(item => {
      const theRegion = template.regions.find(region => region.id === item.regionId);
      for (let [key0, value0] of Object.entries(item.update)) {
        for (let [key1, value1] of Object.entries(value0)) {
          theRegion[key0][key1] = value1;
        }
      }
    });

    await this.ctx.app.redis.set(templateId, JSON.stringify(template), 'EX', TWENTYFOURHOURS);
    const filterDesc = await this.__initFilterGraph(template);

    return filterDesc;
  }

  //给模板区域增减滤波器
  async addDeleteRegionFilters(params: any) {
    const templateId = params.templateId;
    const template = JSON.parse(await this.ctx.app.redis.get(templateId));

    params.regions.forEach(itemRegion => {
      const theRegion = template.regions.find(region => region.id === itemRegion.regionId);
      theRegion.filters = theRegion.filters.concat(...itemRegion.filters.add);
      const deleteFilters = itemRegion.filters.delete;
      theRegion.filters = theRegion.filters.filter(item => deleteFilters.indexOf(item.id) === -1);
    });
    await this.ctx.app.redis.set(templateId, JSON.stringify(template), 'EX', TWENTYFOURHOURS);
    const filterDesc = await this.__initFilterGraph(template);

    return filterDesc;
  }

  //更新模板区域的滤波器
  async updateRegionFilterParams(params: any) {
    const templateId = params.templateId;
    const template = JSON.parse(await this.ctx.app.redis.get(templateId));

    params.filters.forEach(item => {
      template.regions.forEach(itemRegion => {

        if (itemRegion.filters) {

          const findFilter = itemRegion.filters.find(itemFilter => itemFilter.id === item.filterId);
          if (findFilter) {
            for (let [key0, value0] of Object.entries(item.update)) {
              findFilter['options'][key0] = value0;
            }
          };
        }
      });
    });

    await this.ctx.app.redis.set(templateId, JSON.stringify(template), 'EX', TWENTYFOURHOURS);
    const filterDesc = await this.__initFilterGraph(template);

    return filterDesc;
  }



  /**更新合成器实例 */
  async updateTemplate(params) {
    const templateId = params.templateId;
    const template = JSON.parse(await this.ctx.app.redis.get(templateId));

    //循环中有 await 时不能使用 forEach
    for (let itemRegion of params.regions) {
      let theRegion = template.regions.find(item => item.id === itemRegion.id);//查找模板实例中相应的 region

      //数据源映射
      const srcs = await this.ctx.app.redis.get(templateId + "_srcs");
      const srcId = itemRegion.srcId;
      if (srcId) {
        theRegion = await this.__src2Region(theRegion, JSON.parse(srcs), srcId);
      }

      //空间控制
      const area = itemRegion.area;
      if (area) {
        theRegion = await this.__regionSpaceChange(theRegion, area);
      }

      //滤波器更新（增减更）
      const filters = itemRegion.filters;
      if (filters) {
        theRegion = await this.__updateRegionFilterParams(theRegion, filters.update);
        theRegion = await this.__addDeleteRegionFilters(theRegion, filters.add, filters.delete);
      }
    }

    await this.ctx.app.redis.set(templateId, JSON.stringify(template), 'EX', TWENTYFOURHOURS);
    const filterDesc = await this.__initFilterGraph(template);

    return filterDesc;
  }


  /**通过模板及其参数构造滤波器图 */
  private async __initFilterGraph(template: any) {
    console.log('============= start to init filter graph ============');
    const t1 = Date.now();

    this.__checkTemplate(template);

    // const regions = template.regions as Array<any>;

    const regions = template.regions.filter(item => ['video', 'audio', 'picture'].indexOf(item.type) > -1) as Array<any>;


    //第一步：把数据源写入滤波器 movie, 作为文件输入使用
    const inputs = regions.map(region => {
      return `movie='${region.src.path.replace(':', '\\:')}'[${region.id}]`
    });

    //第二步：对不同的区域数据源使用 filter-chain
    let regionsNameAfterFilter = [];
    const filterChains = regions.map(region => {
      //如果没有 filter, 返回空数组
      if (!region.filters || region.filters.length === 0) {
        regionsNameAfterFilter.push(region.id);
        return '';
      }

      //排序后的filter
      const filtersSorted = region.filters.filter(item => item.name !== "shapemask").sort((a, b) => a.seq - b.seq);

      const filterDesc = filtersSorted.map(itemFilter => {
        if (!itemFilter.options) {
          return `${itemFilter.name}`;
        }

        let filterStr = `${itemFilter.name}=`;
        let propertys = []
        for (let [key, val] of Object.entries(itemFilter.options)) {
          propertys.push(`${key}=${val}`);
        }
        return filterStr + (propertys.join(':'));
      })

      regionsNameAfterFilter.push(region.id + '_prepro');
      return `[${region.id}]` + filterDesc.join(",") + `[${region.id}_prepro]`;
    });


    //第二步（2）：如果有形状要求（蒙版），则需要先合成中间形态

    const maskFilterChains = regions.map(region => {

      if (!region.filters || region.filters.length === 0) {
        return '';
      }

      //排序后的蒙版滤波器
      const maskFilter = region.filters.filter(item => item.name === "shapemask");
      if (maskFilter.length === 0) {
        return '';
      }

      const regionId = region.id;
      //移除没有添加蒙版的输出
      const index = regionsNameAfterFilter.indexOf(regionId + '_prepro');
      regionsNameAfterFilter.splice(index, 1);

      //增加蒙版处理后的输出
      regionsNameAfterFilter.push(regionId + '_maskmerge');

      const scaleOptions = region.filters.find(item => item.name === 'scale').options;

      return `movie='/opt/application/tx-rtcStream/files/resources/mask.png'[${regionId}_mask];[${regionId}_mask]alphaextract,scale=w=${scaleOptions.w}:h=${scaleOptions.h}:[${regionId}_premask];[${regionId}_prepro][${regionId}_premask]alphamerge[${regionId}_maskmerge]`;
    });

    //第三步：按照 layer(regionId 中的 z 数据) 关系进行 overlay
    const regionsSorted = regionsNameAfterFilter.sort((a, b) => {
      const layerA = a.split('_')[1].split('.')[0];
      const layerB = b.split('_')[1].split('.')[0];
      return Number(layerA) - Number(layerB);
    })

    const regionsToOverlay = regionsSorted.filter(regionId => {
      let regionIdTrue = '';
      if (regionId.indexOf('_prepro') > -1) {
        regionIdTrue = regionId.slice(0, regionId.indexOf('_prepro'));
      } else if (regionId.indexOf('_maskmerge') > -1) {
        regionIdTrue = regionId.slice(0, regionId.indexOf('_maskmerge'));
      } else {
        regionIdTrue = regionId;
      }
      const theRegion = template.regions.find(region => region.id === regionIdTrue && region.area);
      return theRegion;
    })

    let overlays = [];
    let lastFilterTag = '';// 标记最后一个输出 
    for (let i = 0; i < regionsToOverlay.length; i++) {
      const regionLabel = regionsToOverlay[i];
      let regionId = '';
      if (regionLabel.indexOf('_prepro') > -1) {
        regionId = regionLabel.slice(0, regionLabel.indexOf('_prepro'));
      } else if (regionLabel.indexOf('_maskmerge') > -1) {
        regionId = regionLabel.slice(0, regionLabel.indexOf('_maskmerge'));
      } else {
        regionId = regionLabel;
      }

      const theRegion = template.regions.find(region => region.id === regionId);
      if (!theRegion.area) {
        console.log('no area!');
        continue;
      }

      const x = theRegion.area.x;
      const y = theRegion.area.y;
      let desc = '';
      if (i === 0) {
        desc = `[in][${regionLabel}]overlay=${x}:${y}[out0]`; //对应于 c 代码中添加的 [in] 标记
      } else {
        desc = `[out${i - 1}][${regionLabel}]overlay=x=${x}:y=${y}[out${i}]`;
      }
      lastFilterTag = `out${i}`;
      overlays.push(desc);
    }
    console.log('---overlays');
    console.log(overlays);

    //第四步：从 regions 中取出 drawtext 和 subtitles(硬字幕) 作为全局的滤波器 
    const textFilters = template.regions.filter(item => item.type === 'subtitles' || item.type === 'drawtext') as Array<any>;
    textFilters.sort((a, b) => {
      const layerA = a.id.split('_')[1].split('.')[0];
      const layerB = b.id.split('_')[1].split('.')[0];
      return Number(layerA) - Number(layerB);
    });


    const textFiltersSorted = textFilters.map(itemFilter => {
      if (!itemFilter.options) {
        return `${itemFilter.type}`;
      }

      let filterStr = `${itemFilter.type}=`;
      let propertys = []
      for (let [key, val] of Object.entries(itemFilter.options)) {
        propertys.push(`${key}=${val}`);
      }

      let str = `[${lastFilterTag}]` + filterStr + (propertys.join(':'))
      lastFilterTag = `outText_${itemFilter.id}`;
      str += `[${lastFilterTag}]`;
      return str;
    })


    //组合所有 filter-chain
    let filterGraphDesc = [].concat(...inputs, ...filterChains, ...maskFilterChains, ...overlays, ...textFiltersSorted).filter(item => item !== '').join(';');

    const lastTagIndex = filterGraphDesc.indexOf(`[${lastFilterTag}]`);

    //去除最后的输出标记，因为 c 中自动添加了 out 作为最后一个滤波器输出的标记
    filterGraphDesc = filterGraphDesc.slice(0, lastTagIndex);

    // //正则处理，
    // filterGraphDesc = this.__filterGraphRegHandle(filterGraphDesc);

    await this.__writeFilterGraphIntoFile(filterGraphDesc)
    console.log(`--- init filter graph: ${Date.now() - t1} ms`);


    console.log('------- end of  filter graph init --------');


    return filterGraphDesc;
  }

  /**模板有效性检验 */
  private __checkTemplate(template: any) {
    for (let [key, val] of Object.entries(template.profile)) {
      const count = template.regions.filter(item => item.type === key).length;
      if (count !== val) {
        console.error(`--- the template failed at ${key} check`)
        return false;
      }
    }
    return true;
  }

  /**写入服务器文件 */
  private async __writeFilterGraphIntoFile(filterGraph: string) {
    const serverHttp = "https://cosmoserver.tk:4443/stream/render"
    const result = await this._app.curl(serverHttp, {
      method: 'POST',
      data: { text: filterGraph },
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });

    return result;
  }

  // /**
  //  * 正则处理
  //  * 
  //  * 使得 '%{pts\\:hms} 时间戳, 文件路径 http:// 等符号能正常显示
  //  */
  // private __filterGraphRegHandle(filterGraph: string) {
  //   // postman 中参数输入时要用 \\ 转义 \, 但是写入 txt 文件时只能保留一个 \
  //   filterGraph = filterGraph.replace(/\\\\/g, '\\');
  //   return filterGraph;
  // }

  //数据源到模板区域的映射
  async __src2Region(region: any, srcs: any, srcId: any) {
    const theSrc = srcs.find(src => src.id === srcId);
    region.src = theSrc;

    return region;
  }

  //更新模板区域的滤波器
  async __updateRegionFilterParams(region: any, filters: any) {
    filters.forEach(itemFilter => {
      const theFilter = region.filters.find(filter => filter.id === itemFilter.id);
      if (theFilter) {
        for (let [key, val] of Object.entries(itemFilter.options)) {
          theFilter['options'][key] = val;
        }
      };
    });

    return region;
  }

  //给模板区域增减滤波器
  async __addDeleteRegionFilters(region: any, addFilter: any[], deleteFilter: any[]) {
    region.filters = region.filters.concat(...addFilter);
    region.filters = region.filters.filter(item => deleteFilter.indexOf(item.id) === -1);
    return region;
  }

  //模板区域的空间控制
  async __regionSpaceChange(region: any, area: any) {
    for (let [key1, value1] of Object.entries(area)) {
      region['area'][key1] = value1;
    }
    return region;
  }
}