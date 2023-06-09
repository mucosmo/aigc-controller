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
import { TimelineDTO, PptToImageDTO } from '../../dto/aigc/ppt';

import { AigcPptService } from '../../service/transformer/aigc/ppt';
import { FfmpegService } from '../../service/stream/ffmpeg';

import { AigcUploadService } from '@/app/service/upload/aigc';
import { UploadFileDTO } from '@/app/dto/aigc/upload';


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

  @Inject('aigcUploadService')
  aigcUploadService: AigcUploadService;

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
    try {
      const ret = await this.aigcPptService.ffmpegProgress(params.user);
      if (ret && ret.occupied) {
        ctx.helper.fail({ status: ret }, '被占用，请稍后', 409);
        return;
      }
      const body = this.aigcPptService.pptToFfmpeg(params);
      const duration = this.aigcPptService.calDuration(params.asset);
      params.user.duration = duration;
      await this.ffmpegService.localFile(body, params.user);
      body.sink.roomId = undefined;
      body.sink.userId = undefined;
      body.sink.path = undefined;
      ctx.helper.success({ sink: body.sink });
    } catch (error) {
      ctx.logger.error(error);
      ctx.helper.fail(error, error.name);
    }
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
  async ppt2VideoProgress(ctx: Context, @Body(ALL) params: { taskId: string }) {
    try {
      const progress = await this.aigcPptService.ffmpegProgress(params.taskId);
      ctx.helper.success({ status: progress });
    } catch (error) {
      ctx.logger.error(error);
      ctx.helper.fail(error, error.name);
    }

  }

  @Post('/upload', {
    summary: '上传文件',
    description: '',
  })
  @Validate()
  async upload(ctx: Context, @Body(ALL) params: UploadFileDTO) {
    try {
      const ret = await this.aigcUploadService.save(params);
      ctx.helper.success(ret);
    } catch (error) {
      ctx.logger.error(error);
      ctx.helper.fail(error, error.name);
    }
  }

  @Post('/ppt2img', {
    summary: 'ppt 转图片',
    description: '',
  })
  @Validate()
  async ppt2Image(ctx: Context, @Body(ALL) body: PptToImageDTO) {
    try {
      const taskId = await this.aigcPptService.ppt2Image(body);
      ctx.helper.success({ taskId });
    } catch (error) {
      ctx.logger.error(error);
      ctx.helper.fail(error, error.name);
    }

  }

  @Post('/ppt2img/callback', {
    summary: 'ppt 转图片',
    description: '',
  })
  @Validate()
  async ppt2ImageCallback(ctx: Context, @Body(ALL) body: any) {
    try {
      const { taskId, output, callback } = body;
      const images = await this.aigcPptService.ppt2ImageCallback(output);
      await this.aigcPptService.callbackRemote(taskId, images, callback);
      ctx.helper.success(images);
    } catch (error) {
      ctx.logger.error(error);
      ctx.helper.fail(error, error.name);
    }

  }
}
