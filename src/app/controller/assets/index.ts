import {
  Controller,
  Provide,
  Post,
  Validate,
  Inject,
  Body,
  ALL
} from '@midwayjs/decorator';

import { Context } from '@/interface';

import { FfmpegService } from '../../service/stream/ffmpeg';

import { AssetsListsDTO } from '../../dto/assets/assets';


@Provide()
@Controller('/assets', {
  tagName: '房间管理',
  description: '',
})
export class AssetsController {
  @Inject('ffmpegService')
  ffmpegService: FfmpegService;

  @Post('/lists', {
    summary: '初始化模板',
    description: '',
  })
  @Validate()
  async initTemplate(ctx: Context, @Body(ALL) params: AssetsListsDTO) {
    const type = params.type.toLowerCase();

    ctx.helper.success(assets[type]);
  }

  @Post('/categories', {
    summary: '初始化模板',
    description: '',
  })
  @Validate()
  async initTemplatdde(ctx: Context) {

    ctx.helper.success(category);
  }

  @Post('/metadata', {
    summary: '初始化模板',
    description: '',
  })
  @Validate()
  async getMetadata(ctx: Context, @Body(ALL) params: string[]) {
    const data = await this.ffmpegService.getMetadata(params);
    ctx.helper.success(data);
  }

}


const category = [{
  title: "material",
  key: "0-0",
  children: [
    {
      title: "RTC",
      key: "0-0-0",
    },
    {
      title: "videos",
      key: "0-0-1",
    },
    {
      title: "audios",
      key: "0-0-2",
    },
    {
      title: "images",
      key: "0-0-3",
    },
  ],
}]




const assets = {
  videos: [
    {
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/40_input.mp4',
      title: '40s 时钟视频'
    },
    {
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/forest.mp4',
      title: '森林'
    }

  ],
  images: [
    {
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      title: '流控制器'
    },
    {
      previewImage: 'https://chaosyhy.com:60125/files/resources/image1.jpg',
      url: 'https://chaosyhy.com:60125/files/resources/image1.jpg',
      title: '拉萨'
    }
  ],
  audios: [
    {
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/彩虹.mp3',
      title: '周杰伦-彩虹'
    },
    {
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/成都.mp3',
      title: '赵雷-成都'
    }
  ],
  rtc: [
    {
      room: 'room1',
      members: ['user11', 'user12']
    },
    {
      room: 'room2',
      members: ['user21', 'user22']
    }
  ]

}
