
import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';

import { Context } from '@/interface';

import { AdminUserModel } from '../../model/admin-user';

/** 24小时的秒数，用于 redis 缓存 */
const TWENTYFOURHOURS = 24 * 60 * 60;


@Provide()
export class RenderService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(AdminUserModel)
  adminUserModel: Repository<AdminUserModel>;


  avFilterGraph(params: any) {
    const filter = `movie=/opt/application/tx-rtcStream/files/resources/${params.img0}[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/${params.video2}[m2];movie=/opt/application/tx-rtcStream/files/resources/${params.img3}[m3];movie=/opt/application/tx-rtcStream/files/resources/${params.video4}[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=${params.dh.x}:${params.dh.y}[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=text=${params.drawtext.text}:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=${params.drawtext.x}:y=${params.drawtext.y}:fontcolor=${params.drawtext.color}:fontsize=${params.drawtext.fontsize}:shadowx=2:shadowy=2`

    return filter;
  }

  //初始化模板
  async initTemplate(params: any) {
    const regions = params.template.regions;
    const filters = params.filters;
    const srcs = params.srcs;
    const src2Regions = params.src2Regions;

    //初始化滤波器
    filters.forEach(filter2Region => {
      const theRegion = regions.find(region => region.id === filter2Region.regionId);
      theRegion.filters = filter2Region.filters;
    });

    //初始化数据源
    src2Regions.forEach(src2Region => {
      const theRegion = regions.find(region => region.id === src2Region.regionId);
      const theSrc = srcs.find(src => src.id === src2Region.srcId)
      theRegion.src = theSrc;
    });

    //存储初始化后的模板
    const key = params.template.id;
    const template = params.template;
    await this.ctx.app.redis.set(key, JSON.stringify(template), 'EX', TWENTYFOURHOURS); // EX 秒，PX 毫秒

    //存储数据源，和 template 匹配
    await this.ctx.app.redis.set(key + "_srcs", JSON.stringify(params.srcs), 'EX', TWENTYFOURHOURS);

    this.initFilterGraph(template)

    const result = await this.ctx.app.redis.get(key);
    return JSON.parse(result);
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
    return template;
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
    return template;
  }

  //给模板区域增减滤波器
  async addDeleteRegionFilters(params: any) {

  }

  //更新模板区域的滤波器
  async updateRegionFilterParams(params: any) {
    const templateId = params.templateId;
    const template = JSON.parse(await this.ctx.app.redis.get(templateId));

    params.filters.forEach(item => {
      template.regions.forEach(itemRegion => {
        const findFilter = itemRegion.filters.find(itemFilter => itemFilter.id === item.filterId);
        if (findFilter) {
          for (let [key0, value0] of Object.entries(item.update)) {
            findFilter['options'][key0] = value0;
          }
          return false; // 并不能中断外层的 forEach， 暂不修复
        };
      });
    });

    await this.ctx.app.redis.set(templateId, JSON.stringify(template), 'EX', TWENTYFOURHOURS);
    return template;
  }


  /**通过模板及其参数构造滤波器图 */
  async initFilterGraph(template: any) {
    console.log('============= start to init filter graph ============');

    // const filter = `movie=/opt/application/tx-rtcStream/files/resources/${params.img0}[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/${params.video2}[m2];movie=/opt/application/tx-rtcStream/files/resources/${params.img3}[m3];movie=/opt/application/tx-rtcStream/files/resources/${params.video4}[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=${params.dh.x}:${params.dh.y}[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=text=${params.drawtext.text}:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=${params.drawtext.x}:y=${params.drawtext.y}:fontcolor=${params.drawtext.color}:fontsize=${params.drawtext.fontsize}:shadowx=2:shadowy=2`

    const regions = template.regions as Array<any>;

    //第一步：把数据源写入滤波器 movie, 作为文件输入使用
    const inputs = regions.map(region => {
      return `movie=${region.src.path}[${region.id}]`
    });
    console.log('---inputs');
    console.log(inputs);

    //第二步：对不同的区域数据源使用 filter-chain
    let regionsNameAfterFilter = [];
    const filterChains = regions.map(region => {
      //如果没有 filter, 返回空数组
      if (!region.filters || region.filters.length === 0) {
        regionsNameAfterFilter.push(region.id);
        return '';
      }

      //排序后的filter
      const filtersSorted = region.filters.sort((a, b) => a.seq - b.seq);

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

      regionsNameAfterFilter.push(region.id + '_filt');
      return `[${region.id}]` + filterDesc.join(",") + `[${region.id}_filt]`;
    });
    console.log('---filterChains');
    console.log(filterChains);

    //第三步：按照 layer(regionId 中的 z 数据) 关系进行 overlay
    const regionsSorted = regionsNameAfterFilter.sort((a, b) => {
      const layerA = a.split('_')[1].split('.')[0];
      const layerB = b.split('_')[1].split('.')[0];
      return Number(layerA) - Number(layerB);
    })
    console.log('---regionsSorted');
    console.log(regionsSorted);
    const regionsToOverlay = regionsSorted.filter(regionId => {
      const index = regionId.indexOf('_filt');
      let regionIdTrue = '';
      if (index > -1) {
        regionIdTrue = regionId.slice(0, index);
      } else {
        regionIdTrue = regionId;
      }
      const theRegion = template.regions.find(region => region.id === regionIdTrue && region.area);
      return theRegion;
    })

    let overlays = [];
    for (let i = 1; i < regionsToOverlay.length; i++) {
      const regionLabel = regionsToOverlay[i];
      const index = regionLabel.indexOf('_filt');
      let regionId = '';
      if (index > -1) {
        regionId = regionLabel.slice(0, index);
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
      if (i === 1) {
        desc = `[${regionsToOverlay[0]}][${regionLabel}]overlay=${x}:${y}[out1]`;
      } else if (i === regionsToOverlay.length - 1) {
        desc = `[out${i - 1}][${regionLabel}]overlay=${x}:${y}`;
      } else {
        desc = `[out${i - 1}][${regionLabel}]overlay=${x}:${y}[out${i}]`;
      }
      overlays.push(desc);
    }
    console.log('---overlays');
    console.log(overlays);

    //组合所有 filter-chain
    const filterGraph = [].concat(...inputs).concat(...filterChains).concat(...overlays).join(';');

    console.log('--- filter graph');
    console.log(filterGraph);

    console.log('------- end of  filter graph init --------');


    return filterGraph;
  }

}