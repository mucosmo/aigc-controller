
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
    const command = await this._overlay(data, channel);
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

  private async _overlay(data: RtpRoomDTO, channel: any) {
    const filterParams = data.params as {
      globalOptions: any[],
      outputOptions: any[],
      background: string,
    }
    const { filterGraphDesc, inputs } = await this.renderService.initTemplate(filterParams, 'ffmpeg');
    const globalOptions = filterParams.globalOptions && filterParams.globalOptions.length > 0 ? ' ' + filterParams.globalOptions.join(' ') : '';
    const outputOpts = filterParams.outputOptions && filterParams.outputOptions.length > 0 ? ' ' + filterParams.outputOptions.join(' ') : '';
    const inputsStr = inputs.map(input => ` ${input.options ? input.options.join(' ') : ''} -i ${input.src.path}`);

    const command = [
      `ffmpeg`,
      globalOptions,
      ` -i /opt/application/tx-rtcStream/files/resources/${filterParams.background}`,
      ...inputsStr,
      ` -filter_complex "${filterGraphDesc}[ret]"`,
      outputOpts,
      ` -map "[ret]:v" -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 -ssrc ${channel.rtpParameters.VIDEO_SSRC} -payload_type ${channel.rtpParameters.VIDEO_PT}`,
      ` -f rtp rtp://${channel.videoTransport.ip}:${channel.videoTransport.port}`,
    ].concat(
      data.streams?.includes("audio") ?
        [
          ` -map 0:a -c:a libopus -ssrc ${channel.rtpParameters.AUDIO_SSRC} -payload_type ${channel.rtpParameters.AUDIO_PT}`,
          ` -f rtp rtp://${channel.audioTransport.ip}:${channel.audioTransport.port}`
        ] : []
    ).join('');
    return command;
  }

}

// async function concat(){

// }