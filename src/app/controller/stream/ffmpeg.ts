import {
  Controller,
  Provide,
  Inject,
  ALL,
  Post,
  Get,
  Validate,
  Body,
} from '@midwayjs/decorator';

import { Context } from '@/interface';


import { FfmpegService } from '../../service/stream/ffmpeg';
import { RtpRoomDTO, LocalFileDTO } from '../../dto/stream/ffmpeg';


@Provide()
@Controller('/stream/ffmpeg', {
  tagName: '直接使用 ffmpeg 推流',
  description: '',
})
export class FfmepegController {
  @Inject('ffmpegService')
  ffmpegService: FfmpegService;

  @Post('/rtp/room', {
    summary: '通过 rtp 协议送到 rtc 房间',
    description: '',
  })
  @Validate()
  async push2RtpRoom(ctx: Context, @Body(ALL) params: RtpRoomDTO) {
    const data = await this.ffmpegService.rtpRoom(params);
    ctx.helper.success(data);
  }

  @Get('/rtp/command/stats', {
    summary: '获取 rtp 推流的状态',
    description: '',
  })
  @Validate()
  async getRtpStats(ctx: Context) {
    const data = await this.ffmpegService.getCommandStats();
    //FIXME: no response to postman
    ctx.helper.success(data);
  }


  @Post('/file', {
    summary: '通过 rtp 协议送到 rtc 房间',
    description: '',
  })
  @Validate()
  async generateLocalFile(ctx: Context, @Body(ALL) params: LocalFileDTO) {
    const data = await this.ffmpegService.localFile(params);
    ctx.helper.success(data);
  }


  @Post('/metadata', {
    summary: '获取文件或者流的元数据',
    description: '',
  })
  @Validate()
  async getMetadataOfFiles(ctx: Context, @Body(ALL) params: string[]) {
    const data = await this.ffmpegService.getMetadata(params);
    ctx.helper.success(data);
  }

}
