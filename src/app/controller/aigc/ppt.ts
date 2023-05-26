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


import { MixerService } from '../../service/mixer/mixer';
import { TimelineDTO } from '../../dto/aigc/ppt';

import { AigcPptService } from '../../service/transformer/aigc/ppt';
import { FfmpegService } from '../../service/stream/ffmpeg';

// import fs from 'fs';


@Provide()
@Controller('/aigc', {
  tagName: 'aigc 生成',
  description: '',
})
export class AigcController {
  @Inject('aigcPptService')
  aigcPptService: AigcPptService;

  @Inject('ffmpegService')
  ffmpegService: FfmpegService;

  @Inject('mixerService')
  mixerService: MixerService;


  @Post('/ppt2video', {
    summary: 'ppt 生成视频并保存',
    description: '',
  })
  @Validate()
  async generateLocalFile(ctx: Context, @Body(ALL) params: TimelineDTO) {
    let body = this.aigcPptService.pptToFfmpeg(params);
    const command = await this.ffmpegService.localFile(body, params.user);
    ctx.helper.success({ sink: body.sink, command });
  }

  @Post('/ppt2video/progress', {
    summary: '视频生成进度',
    description: '',
  })
  @Validate()
  async ppt2VideoProgress(ctx: Context, @Body(ALL) params: { user: { tenant: string, name: string, path: string } }) {
    // const ret = fs.existsSync(params.user.path)
    const progress = this.aigcPptService.ffmpegProgress(params.user);
    ctx.helper.success({ progress });
  }

}
