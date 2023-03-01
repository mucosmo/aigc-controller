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


import { FfmpegService } from '../../service/stream/ffmpeg';
import { RtpRoomDTO } from '../../dto/stream/ffmpeg';


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

}