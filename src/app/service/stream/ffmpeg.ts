
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { RtpRoomDTO, LocalFileDTO, StreamsEnableDTO } from '../../dto/stream/ffmpeg';

import { RenderService } from '../../service/render/render';

import { StreamPushService } from '../../service/stream/push';

import ffmpeg from 'fluent-ffmpeg';

/** 24小时的秒数，用于 redis 缓存 */
const OneDaySeconds = 24 * 60 * 60;

const MEDIASOUP_SERVER_HOST = process.env.MEDIASOUP_SERVER_HOST;

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
    const peerId = 'node_' + data.sink.userId + Math.random().toString(36).slice(2);
    const channel = await this.streamPushService.openStreamPush({ ...data.sink, peerId, ...data.streams });
    const commandStats = await this.getCommandStats();
    commandStats.currentFrame = 0;
    const { partialCommand, lastFilterTag } = await this.filterComplex({...data, startFrame:commandStats.currentFrame});

    const videoSink = [
      `-map "[${lastFilterTag}]:v" -c:v vp8 -b:v 1000k -deadline 1 -cpu-used 2 `,
      `-ssrc ${channel.rtpParameters.VIDEO_SSRC} -payload_type ${channel.rtpParameters.VIDEO_PT}`,
      `-f rtp rtp://${channel.videoTransport.ip}:${channel.videoTransport.port}`
    ].join(' ');

    const audioSink = data.streams.audio ? [
      `-map "[a]" -c:a libopus -ac 1 -ssrc ${channel.rtpParameters.AUDIO_SSRC} -payload_type ${channel.rtpParameters.AUDIO_PT}`,
      `-f rtp rtp://${channel.audioTransport.ip}:${channel.audioTransport.port}`
    ].join(' ') : '';

    const command = [...partialCommand, videoSink, audioSink].join(' ');

    return await this.executeCommand({ command, peerId, roomId: data.sink.roomId });
  }


  /**composite video with ffmpeg to generate local file */
  async localFile(data: LocalFileDTO) {
    const { partialCommand, lastFilterTag } = await this.filterComplex({...data, startFrame:0});

    const videoSink = [
      `-map "[${lastFilterTag}]:v"`
    ].join(' ');

    const audioSink = data.streams.audio ? [
      `-map "[a]"`
    ].join(' ') : '';

    const fileSink = [
      videoSink,
      audioSink,
      `${data.sink.path}`
    ].join(' ');

    const command = [...partialCommand, fileSink].join(' ');

    return await this.executeCommand({ command });;
  }

  /**get the metadata of files or streams */
  async getMetadata(iPaths: any[]) {
    const t1 = new Date().getTime();
    const paths = [...new Set(iPaths)];// 去重复
    const filesMeta = {};
    let metadata;
    for (let path of paths) {
      const key = `ffmpeg:metadata:${path.replace(/:/g, '')}`;
      const stored = await this._app.redis.get(key);
      if (stored) {
        metadata = JSON.parse(stored);
      } else {
        metadata = await asyncFfprobe(path);
        this._app.redis.set(key, JSON.stringify(metadata), 'EX', OneDaySeconds);
      }
      filesMeta[path] = metadata;
    }
    console.log(new Date().getTime() - t1)
    return filesMeta;
  }

  private async filterComplex(data: { streams: StreamsEnableDTO, render: any, startFrame: number }) {
    const filterParams = data.render as {
      globalOptions: any[],
      outputOptions: any[],
      background: string,
    }
    const { template } = await this.renderService.initTemplate(filterParams);
    const { filterGraphDesc: filteGraphVideo, videos, lastFilterTag } = await this.renderService.videoFilterGraph(template, data.startFrame, 'ffmpeg'); // 耗时小于 10 ms
    const { filterGraphAudio, audios } = await this.renderService.audioFilterGraph(template);

    const inputs = [...videos, ...audios];
    // await this.getMetadata(inputs.map(input => input.src.path));
    const globalOptions = filterParams.globalOptions?.length > 0 ? filterParams.globalOptions.join(' ') : '';
    const outputOpts = filterParams.outputOptions?.length > 0 ? filterParams.outputOptions.join(' ') : '';
    const inputsStr = inputs.map(input => `${input.options ? input.options.join(' ') : ''} -i ${input.src.path}`).join(' ');

    let filterComplex = [
      data.streams.audio ? filterGraphAudio : '',
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
  async executeCommand(data: { command: string, roomId?: string, peerId?: string }) {
    const url = `${MEDIASOUP_SERVER_HOST}/rtc/room/command`;
    const result = await this._app.curl(url, {
      method: 'POST',
      data,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    return result.data;
  }

  async getCommandStats(){
    const url = `${MEDIASOUP_SERVER_HOST}/rtc/room/command/stats`;
    const result = await this._app.curl(url, {
      method: 'GET',
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