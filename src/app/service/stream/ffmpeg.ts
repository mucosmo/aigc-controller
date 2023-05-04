
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { RtpRoomDTO, LocalFileDTO, StreamsEnableDTO } from '../../dto/stream/ffmpeg';

import { RenderService } from '../../service/render/render';

import { StreamPushService } from '../../service/stream/push';

import ffmpeg from 'fluent-ffmpeg';

import crypto from 'crypto';

import path from 'path';

import { Repository } from 'typeorm';

import { RtcAssetModel } from '/opt/application/tx-streamPpr/src/app/model/rtc-asset';

import { InjectEntityModel } from '@midwayjs/orm';



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

  @InjectEntityModel(RtcAssetModel)
  private rtcAssetModel: Repository<RtcAssetModel>;

  /**composite video with ffmpeg and push to rtp room */
  async rtpRoom(data: RtpRoomDTO) {
    const peerId = 'node_' + data.sink.userId + Math.random().toString(36).slice(2);
    const channel = await this.streamPushService.openStreamPush({ ...data.sink, peerId, ...data.streams });
    const ffmpegStats = await this.getFfmpegStats(data.sink.roomId);
    console.log('---ffmpegStats -->', ffmpegStats)
    const currentTime = ffmpegStats.currentTime;
    let { partialCommand, lastFilterTag, template } = await this.filterComplex({ ...data, startFrame: ffmpegStats.currentFrame, skipTime: currentTime });


    console.log('---- lastFilterTag -->', lastFilterTag)
    const videoSink = [
      `-map "[${lastFilterTag}]:v" -c:v vp8 -b:v 500k -deadline realtime -cpu-used 2 -r 30 -vsync drop -auto-alt-ref 0`,
      `-ssrc ${channel.rtpParameters.VIDEO_SSRC} -payload_type ${channel.rtpParameters.VIDEO_PT}`,
      `-f rtp rtp://${channel.videoTransport.ip}:${channel.videoTransport.port}`
    ].join(' ');

    const audioSink = template.audios.length ? [
      `-map "[a]" -c:a libopus -ac 1 -ssrc ${channel.rtpParameters.AUDIO_SSRC} -payload_type ${channel.rtpParameters.AUDIO_PT}`,
      `-f rtp rtp://${channel.audioTransport.ip}:${channel.audioTransport.port}`
    ].join(' ') : '';

    const command = [...partialCommand, videoSink, audioSink].join(' ');

    const execRet = await this.executeCommand({ command, peerId, roomId: data.sink.roomId });

    return { command, execRet }
  }


  /**composite video with ffmpeg to generate local file */
  async localFile(data: LocalFileDTO) {
    const { partialCommand, lastFilterTag } = await this.filterComplex({ ...data, startFrame: 0, skipTime: 0 });

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


  async connectSource(params: { [key: string]: { path: string, type: string, url: string, name: string, metadata: any } }) {
    for (let val of Object.values(params)) {
      const filePath = val.path;
      val.name = path.basename(filePath)
      val.url = filePath.replace('/opt/application/tx-rtcStream', 'https://chaosyhy.com:60125')
      const md5 = crypto.createHash('md5').update(val.url).digest('hex').toUpperCase();
      const redisKey = `ffmpeg:srcs:${md5}`;

      val.metadata = await asyncFfprobe(filePath);

      await this._app.redis.set(redisKey, JSON.stringify(val));

      await this.rtcAssetModel.save([
        {
          md5,
          fileName: val.name,
          fileUrl: val.url,
          filePath,
          metadata: val.metadata,
          fileType: val.type,
        }
      ])
    }
  }

  private async filterComplex(data: { streams: StreamsEnableDTO, render: any, startFrame: number, skipTime: number }) {
    const filterParams = data.render as {
      globalOptions: any[],
      outputOptions: any[],
      background: string,
    }
    let { template } = await this.renderService.initTemplate(filterParams);
    template = this.renderService.templateWithClip(template, data.skipTime);
    const { filterGraphDesc: filteGraphVideo, videos, lastFilterTag } = await this.renderService.videoFilterGraph(template, data.startFrame, 'ffmpeg'); // 耗时小于 10 ms
    const { filterGraphAudio, audios } = await this.renderService.audioFilterGraph(template);

    const inputs = [...videos, ...audios];
    // await this.getMetadata(inputs.map(input => input.src.path));
    const globalOptions = filterParams.globalOptions?.length > 0 ? filterParams.globalOptions.join(' ') : '';
    const outputOpts = filterParams.outputOptions?.length > 0 ? filterParams.outputOptions.join(' ') : '';
    const inputsStr = handleFfmpegInputOptions(inputs, 0);

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

    return { partialCommand, lastFilterTag, template };
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

  async getFfmpegStats(roomId) {
    const url = `${MEDIASOUP_SERVER_HOST}/rtc/room/command/stats`;
    const result = await this._app.curl(url, {
      method: 'POST',
      dataType: 'json',
      data: { roomId },
      headers: {
        'content-type': 'application/json',
      },
    });

    // const currentFrame = parseFrame(result.data) && 0;
    // const currentTime = parseTime(result.data);

    const startTime = result.data.startTime;
    let currentTime = 0;
    if (startTime === 0) {
      currentTime = 0;
    } else {
      currentTime = parseFloat(((new Date().getTime() - startTime) / 1000).toFixed(2));
    }
    //FIXME: currentTime shoudl be true value instead of 0
    return { currentFrame: 0, currentTime: 0 && currentTime };
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

// function parseFrame(data) {
//   // frame=   10 fps=6.9 q=16.0 size=      45kB time=00:00:00.36 bitrate=1030.9kbits/s speed=0.249x
//   if (!data) return 0;
//   const regex = /frame=\s*(\d+)/;
//   const match = regex.exec(data);
//   if (match) {
//     const number = parseInt(match[1]);
//     return number;
//   }
//   return 0;
// }

// // parse current timecode of executed ffmpeg command into seconds
// function parseTime(data: string) {
//   // frame=   10 fps=6.9 q=16.0 size=      45kB time=00:00:00.36 bitrate=1030.9kbits/s speed=0.249x
//   console.log(data)
//   let ret = 0;
//   // frame= 1200 fps= 28 q=4.0 Lsize=    1355kB time=00:04:23.77 bitrate=  42.1kbits/s speed=6.08x    
//   // video:1334kB audio:502kB subtitle:0kB other streams:0kB global headers:0kB muxing overhead: unknown
//   if (!data || data.includes('subtitle')) return ret;
//   let regex = /time=(\d{2}):(\d{2}):(\d{2}\.\d{1,3})/;
//   let match = regex.exec(data);
//   if (match) {
//     const hours = parseInt(match[1]);
//     const minutes = parseInt(match[2]);
//     const seconds = parseFloat(match[3]);
//     ret = hours * 3600 + minutes * 60 + seconds;
//   }
//   return ret;
// }


// to handle ffmpeg input options, including -i, -re, -ss, -t and so on
// for -ss and -t that means clip of input, we have to consider the time to skip while editing
function handleFfmpegInputOptions(inputs, skipTime) {
  const str = inputs.map(input => {
    let optionStr = '';
    if (input.options) {
      input.options = input.options.map(option => {
        if (option.includes('-ss')) {
          const time = parseFloat(option.split(/\s+/)[1]);
          option = `-ss ${time + skipTime}`;
        }
        return option;
      });
      optionStr += input.options.join(' ');
    }
    optionStr += ` -i ${input.src.path}`;
    return optionStr;
  }).join(' ');
  return str;
}