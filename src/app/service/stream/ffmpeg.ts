
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { RtpRoomDTO } from '../../dto/stream/ffmpeg';

import { RenderService } from '../../service/render/render';

import { StreamPushService } from '../../service/stream/push';

@Provide()
export class FfmpegService {
  @Inject()
  ctx: Context;

  @Inject()
  private renderService!: RenderService;

  @Inject()
  private streamPushService!: StreamPushService;

  @App()
  private _app!: Application;

  /**composite video with ffmpeg and push to rtp room */
  async rtpRoom(data: RtpRoomDTO) {
    const channel = await this.streamPushService.openStreamPush(data);
    const url = "https://cosmoserver.tk:4443/stream/ffmpeg/rtp/room";
    const commandWithoutChannel = await this._overlay(data);
    const command = commandWithoutChannel + ` -f rtp rtp://${channel.videoTransport.ip}:${channel.videoTransport.port}`;
    const result = await this._app.curl(url, {
      method: 'POST',
      data: { command, channelSessionId: channel.sessionId },
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    return result.data;
  }

  private async _overlay(data: RtpRoomDTO) {
    const filterParams = data.params as {
      globalOptions: any[],
      outputOptions: any[],
      background: string,
    }
    const { filterGraphDesc, inputs } = await this.renderService.initTemplate(filterParams, 'ffmpeg');
    const globalOptions = filterParams.globalOptions && filterParams.globalOptions.length > 0 ? ' ' + filterParams.globalOptions.join(' ') : '';
    const outputOpts = filterParams.outputOptions && filterParams.outputOptions.length > 0 ? ' ' + filterParams.outputOptions.join(' ') : '';

    const inputsStr = inputs.map(input => ` ${input.options ? input.options.join(' ') : ''} -i ${input.src.path}`);
    const commandWithoutChannel = [
      `ffmpeg`,
      globalOptions,
      ` -i /opt/application/tx-rtcStream/files/resources/${filterParams.background}`,
      ...inputsStr,
      ` -filter_complex "${filterGraphDesc}"`,
      outputOpts,
      ` -an -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 -ssrc 2222 -payload_type 101`
    ].join('');

    return commandWithoutChannel;

  }

}

// async function concat(){

// }