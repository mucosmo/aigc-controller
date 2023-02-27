
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { RtpRoomDTO } from '../../dto/stream/ffmpeg';

import { RenderService } from '../../service/render/render';

@Provide()
export class FfmpegService {
  @Inject()
  ctx: Context;

  @Inject()
  private renderService!: RenderService;

  @App()
  private _app!: Application;

  /**composite video with ffmpeg and push to rtp room */
  async rtpRoom(data: RtpRoomDTO) {
    const url = "https://cosmoserver.tk:4443/stream/ffmpeg/rtp/room";

    const { inputs } = await this.renderService.initTemplate(data.params, 'ffmpeg');

    const files = inputs.map(input => input.src.path);

    const result = await this._app.curl(url, {
      method: 'POST',
      data: { ...data, inputs: files },
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    return result.data;
  }

}