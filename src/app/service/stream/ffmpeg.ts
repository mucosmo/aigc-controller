
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { RtpRoomDTO, LocalFileDTO } from '../../dto/stream/ffmpeg';

import { RenderService } from '../../service/render/render';

import { StreamPushService } from '../../service/stream/push';

import ffmpeg from 'fluent-ffmpeg';

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
    const channel = await this.streamPushService.openStreamPush(data.sink);
    const { partialCommand, lastFilterTag } = await this.filterComplex(data);

    const videoSink = [
      `-map "[${lastFilterTag}]:v" -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 `,
      `-ssrc ${channel.rtpParameters.VIDEO_SSRC} -payload_type ${channel.rtpParameters.VIDEO_PT}`,
      `-f rtp rtp://${channel.videoTransport.ip}:${channel.videoTransport.port}`
    ].join(' ');

    const audioSink = data.streams?.includes("audio") ? [
      `-map "[a]" -c:a libopus -ac 1 -ssrc ${channel.rtpParameters.AUDIO_SSRC} -payload_type ${channel.rtpParameters.AUDIO_PT}`,
      `-f rtp rtp://${channel.audioTransport.ip}:${channel.audioTransport.port}`
    ].join(' ') : '';

    const command = [...partialCommand, videoSink, audioSink].join(' ');

    return await this.executeCommand(command, channel.sessionId);
  }


  /**composite video with ffmpeg to generate local file */
  async localFile(data: LocalFileDTO) {
    const { partialCommand, lastFilterTag } = await this.filterComplex(data);

    const videoSink = [
      `-map "[${lastFilterTag}]:v"`
    ].join(' ');

    const audioSink = data.streams?.includes("audio") ? [
      `-map "[a]"`
    ].join(' ') : '';

    const fileSink = [
      videoSink,
      audioSink,
      `${data.sink.path}`
    ].join(' ');

    const command = [...partialCommand, fileSink].join(' ');

    return await this.executeCommand(command, 'undefined');;
  }

  /**get the metadata of files or streams */
  async getMetadata(iPaths: any[]) {
    const paths = [...new Set(iPaths)];// 去重复
    const filesMeta = {};
    for (let path of paths) {
      filesMeta[path] = await asyncFfprobe(path);
    }
    return filesMeta;
  }

  private async filterComplex(data: { streams: any[], render: any }) {
    const filterParams = data.render as {
      globalOptions: any[],
      outputOptions: any[],
      background: string,
    }
    const { template } = await this.renderService.initTemplate(filterParams);
    const { filterGraphDesc: filteGraphVideo, videos, lastFilterTag } = await this.renderService.videoFilterGraph(template, 'ffmpeg'); // 耗时小于 10 ms
    const { filterGraphAudio, audios } = await this.renderService.audioFilterGraph(template);

    const inputs = [...videos, ...audios];
    await this.getMetadata(inputs.map(input => input.src.path));
    const globalOptions = filterParams.globalOptions?.length > 0 ? filterParams.globalOptions.join(' ') : '';
    const outputOpts = filterParams.outputOptions?.length > 0 ? filterParams.outputOptions.join(' ') : '';
    const inputsStr = inputs.map(input => `${input.options ? input.options.join(' ') : ''} -i ${input.src.path}`).join(' ');

    let filterComplex = [
      data.streams?.includes('audio') ? filterGraphAudio : '',
      filteGraphVideo,
    ].join('');

    const partialCommand = [
      `ffmpeg`,
      globalOptions,
      inputsStr,
      `-filter_complex "${filterComplex}"`,
      outputOpts
    ];

    return { partialCommand, lastFilterTag };
  }

  /**send to server to execute ffmpeg command */
  async executeCommand(command: string, channelSessionId: string) {
    const url = "https://chaosyhy.com:4443/stream/ffmpeg/rtp/room";
    const result = await this._app.curl(url, {
      method: 'POST',
      data: { command, channelSessionId },
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    return result.data;
  }
}

async function asyncFfprobe(path) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(path, (err, metadata) => {
      if (err) {
        reject(err);
      } else {
        resolve(metadata);
      }
    });
  });
};