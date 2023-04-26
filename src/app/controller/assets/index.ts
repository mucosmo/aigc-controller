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

import { RoomService } from '../../service/room/room';

import { AssetsListsDTO } from '../../dto/assets/assets';


@Provide()
@Controller('/assets', {
  tagName: '房间管理',
  description: '',
})
export class AssetsController {
  @Inject('ffmpegService')
  ffmpegService: FfmpegService;

  @Inject('roomService')
  roomService: RoomService;

  @Post('/lists', {
    summary: '初始化模板',
    description: '',
  })
  @Validate()
  async initTemplate(ctx: Context, @Body(ALL) params: AssetsListsDTO) {
    const type = params.type.toLowerCase();

    let data = null;

    if (type === 'rtc') {
      data = await this.roomService.getRoomStats()
    } else {
      data = assets[type]
    }

    ctx.helper.success(data);
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

  @Post('/source', {
    summary: '关联元数据',
    description: '',
  })
  @Validate()
  async connectSource(ctx: Context, @Body(ALL) params: any) {
    const data = await this.ffmpegService.connectSource(params);
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
    {
      title: "subtitles",
      key: "0-0-4",
    },
  ],
}]




const assets = {
  videos: [
    {
      id: 1,
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/40_input.mp4',
      path: '/opt/application/tx-rtcStream/files/resources/40_input.mp4',
      title: '40s时钟视频'
    },
    {
      id: 2,
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/forest.mp4',
      path: '/opt/application/tx-rtcStream/files/resources/forest.mp4',
      title: '森林'
    },
    {
      id: 3,
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/20_input.mp4',
      path: '/opt/application/tx-rtcStream/files/resources/20_input.mp4',
      title: '20s时钟视频'
    },
    {
      id: 4,
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/video2.mp4',
      path: '/opt/application/tx-rtcStream/files/resources/video2.mp4',
      title: '电脑屏幕'
    },
    {
      id: 5,
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/dh.mp4',
      path: '/opt/application/tx-rtcStream/files/resources/dh.mp4',
      title: '本地数字人'
    },
    {
      id: 6,
      previewImage: 'https://www.baidu.com/img/bd_logo1.png',
      url: 'https://chaosyhy.com:60125/files/resources/testsrc_1280x960_30p.mp4',
      path: '/opt/application/tx-rtcStream/files/resources/testsrc_1280x960_30p.mp4',
      title: '1280P时钟'
    },

  ],
  images: [
    {
      id: 1,
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      path: '/opt/application/tx-rtcStream/files/resources/fileimage.jpg',
      title: '流控制器'
    },
    {
      id: 2,
      previewImage: 'https://chaosyhy.com:60125/files/resources/image1.jpg',
      url: 'https://chaosyhy.com:60125/files/resources/image1.jpg',
      path: '/opt/application/tx-rtcStream/files/resources/image1.jpg',
      title: '拉萨'
    },
    {
      id: 3,
      previewImage: 'https://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg',
      url: 'https://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg',
      path: 'https://alifei05.cfp.cn/creative/vcg/veer/1600water/veer-412747764.jpg',
      title: '网络图片'
    },
    {
      id: 4,
      previewImage: 'https://chaosyhy.com:60125/files/resources/image2.jpg',
      url: 'https://chaosyhy.com:60125/files/resources/image2.jpg',
      path: '/opt/application/tx-rtcStream/files/resources/image2.jpg',
      title: '深山'
    },
    {
      id: 5,
      previewImage: 'https://chaosyhy.com:60125/files/resources/gif.gif',
      url: 'https://chaosyhy.com:60125/files/resources/gif.gif',
      path: '/opt/application/tx-rtcStream/files/resources/gif.gif',
      title: '动态图'
    }
  ],
  audios: [
    {
      id: 1,
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/彩虹.mp3',
      path: '/opt/application/tx-rtcStream/files/resources/彩虹.mp3',
      title: '周杰伦-彩虹'
    },
    {
      id: 2,
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/成都.mp3',
      path: '/opt/application/tx-rtcStream/files/resources/成都.mp3',
      title: '赵雷-成都'
    }
  ],
  subtitles: [
    {
      id: 1,
      previewImage: 'https://chaosyhy.com:60125/files/resources/fileimage.png',
      url: 'https://chaosyhy.com:60125/files/resources/subtitles.srt',
      path: '/opt/application/tx-rtcStream/files/resources/subtitles.srt',
      title: '字幕'
    },
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
