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
  import {  TimelineDTO } from '../../dto/aigc/ppt';

  import { AigcPptService } from '../../service/transformer/aigc/ppt';
  import { FfmpegService } from '../../service/stream/ffmpeg';

  
  @Provide()
  @Controller('/aigc/video', {
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
  
  
    @Post('/ppt/file', {
      summary: 'ppt 文件生成视频并保存',
      description: '',
    })
    @Validate()
    async generateLocalFile(ctx: Context, @Body(ALL) params: TimelineDTO) {
      let body = this.aigcPptService.ppT2Ffmpeg(params);
      const data = await this.ffmpegService.localFile(body);
      ctx.helper.success({body, data});
    }
  
  }
  