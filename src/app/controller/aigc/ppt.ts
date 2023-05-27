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


  /**
   * @api {post} /aigc/ppt2video 请求生成视频
   * @apiName GenerateVideo
   * @apiGroup AIGC
   *
   * @apiBody {Object} data  用户信息
   * @apiBody {String} data.user.tenant  所属租户
   * @apiBody {String} data.user.name   用户名 
   *
   * @apiSuccess {String} path  视频路径
   * @apiSuccess {String} url  视频 url
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *     {
   *      "sink": {
   *           "roomId": "picc",
   *           "userId": "user01",
   *           "path": "/opt/application/data/aigc/picc/user01/20230526_185558.mp4",
   *           "url": "https://chaosyhy.com:60125/data/aigc/picc/user01/20230526_185558.mp4"
   *       }
   * }
  
   */
  @Post('/ppt2video', {
    summary: 'ppt 生成视频并保存',
    description: '',
  })
  @Validate()
  async generateLocalFile(ctx: Context, @Body(ALL) params: TimelineDTO) {
    const ret = await this.aigcPptService.ffmpegProgress(params.user);
    if (ret.occupied) {
      ctx.helper.fail({ occupied: ret.occupied }, '被占用，请稍后', 409);
      return;
    }
    const body = this.aigcPptService.pptToFfmpeg(params);
    await this.ffmpegService.localFile(body, params.user);
    body.sink.roomId = undefined;
    body.sink.userId = undefined;
    body.sink.path = undefined;
    ctx.helper.success({ sink: body.sink });
  }


  /**
   * @api {post} /aigc/ppt2video/progress 查询视频合成进度
   * @apiName GenerateVideoProgress
   * @apiGroup AIGC
   *
   * @apiBody {Object} user  用户信息 <required>.
   * @apiBody {String} user.tenant  所属租户
   * @apiBody {String} user.name   用户名
   *
   * @apiSuccess {Number} progress  进度
   *
   * @apiSuccessExample Success-Response:
   *     HTTP/1.1 200 OK
   *      {
   *              "progress": 0.31
   * }

   *        
   */
  @Post('/ppt2video/progress', {
    summary: '视频生成进度',
    description: '',
  })
  @Validate()
  async ppt2VideoProgress(ctx: Context, @Body(ALL) params: { user: { tenant: string, name: string, path: string } }) {
    // const ret = fs.existsSync(params.user.path)
    const ret = await this.aigcPptService.ffmpegProgress(params.user);
    ctx.helper.success({ progres: ret.progress });
  }

}
