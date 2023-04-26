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


import { FfmpegService } from '../../service/stream/ffmpeg';
import { RtpRoomDTO, LocalFileDTO } from '../../dto/stream/ffmpeg';

const command = {
  "sink": {
      "roomId": "mixer",
      "userId": "mixer001",
      "deviceName": "FFMPEG",
      "displayName": "basic"
  },
  "streams": {
      "video": true,
      "audio": true
  },
  "render": {
      "template": {
          "id": "template123232sdfsde#$",
          "profile": {
              "video": 3,
              "picture": 2,
              "drawtext": 2,
              "subtitles": 1
          },
          "project": {
              "width": 640,
              "height": 480,
              "bgColor": "blue",
              "duration": 50
          },
          "videos": [
              {
                  "id": "region_0.0.0",
                  "level": 0,
                  "type": "video",
                  "srcId": "video_clock_40",
                  "options": [
                      "-re"
                  ],
                  "filters": [
                      {
                          "seq": -2,
                          "name": "geq",
                          "options": {
                              "lum": "'(lum(X,Y)+(256-lum(X-4,Y-4)))/2'",
                              "cr": "'(cr(X,Y)+(256-cr(X-6,Y-6)))/2'",
                              "cb": "'(cb(X,Y)+(256-cb(X-8,Y-8)))/2'"
                          }
                      },
                      {
                          "seq": 0,
                          "name": "crop",
                          "options": {
                              "w": "iw/3",
                              "h": "ih",
                              "x": "2*iw/3",
                              "y": "0"
                          }
                      },
                      {
                          "seq": 1,
                          "name": "scale",
                          "options": {
                              "w": "214",
                              "h": "480"
                          }
                      }
                  ],
                  "area": {
                      "x": "0",
                      "y": "0"
                  }
              },
              {
                  "id": "region_0.0.1",
                  "level": 0,
                  "type": "video",
                  "srcId": "video_forest",
                  "options": [
                      "-re"
                  ],
                  "filters": [
                      {
                          "seq": 1,
                          "name": "scale",
                          "options": {
                              "w": "428",
                              "h": "240"
                          }
                      }
                  ],
                  "area": {
                      "x": "W/3",
                      "y": "0"
                  }
              },
              {
                  "id": "region_0.0.2",
                  "level": 0,
                  "type": "picture",
                  "srcId": "src_pic_dog",
                  "options": [
                      "-re"
                  ],
                  "filters": [
                      {
                          "seq": -1,
                          "name": "crop",
                          "options": {
                              "w": "iw",
                              "h": "ih",
                              "x": "0",
                              "y": "0"
                          }
                      },
                      {
                          "seq": 0,
                          "name": "zoompan",
                          "options": {
                              "z": "'if(between(time,0,6),min(max(zoom,pzoom)+0.015,4),1)'",
                              "d": 480,
                              "x": "1*iw/3-(1*iw/zoom/3)",
                              "y": "2*ih/4-(2*ih/zoom/4)"
                          }
                      },
                      {
                          "seq": 1,
                          "name": "scale",
                          "options": {
                              "w": "428",
                              "h": "240"
                          }
                      }
                  ],
                  "area": {
                      "x": "W/3",
                      "y": "H/2"
                  },
                  "transitions": [
                      {
                          "name": "xfade",
                          "params": {
                              "transition": "wipeleft",
                              "duration": 2,
                              "offset": 10
                          },
                          "to": "region_0.0.4"
                      }
                  ]
              },
              {
                  "id": "region_0.0.4",
                  "level": 0,
                  "type": "video",
                  "srcId": "video_clock_40",
                  "options": [
                      "-re",
                      "-ss 5",
                      "-t 35"
                  ],
                  "filters": [
                      {
                          "seq": 1,
                          "name": "scale",
                          "options": {
                              "w": "640",
                              "h": "480"
                          }
                      },
                      {
                          "seq": 2,
                          "name": "setsar",
                          "options": {
                              "sar": "1:1"
                          }
                      },
                      {
                          "seq": 3,
                          "name": "fps",
                          "options": {
                              "fps": "30"
                          }
                      },
                      {
                          "seq": 4,
                          "name": "settb",
                          "options": {
                              "expr": "1/20"
                          }
                      }
                  ]
              },
              {
                  "id": "region_3.0.1",
                  "type": "video",
                  "srcId": "src_video_dh",
                  "options": [
                      "-re"
                  ],
                  "filters": [
                      {
                          "seq": 0,
                          "name": "crop",
                          "options": {
                              "w": "300",
                              "h": "300",
                              "x": "130",
                              "y": "130"
                          }
                      },
                      {
                          "seq": 1,
                          "name": "scale",
                          "options": {
                              "w": "100",
                              "h": "100"
                          }
                      },
                      {
                          "seq": 3,
                          "name": "chromakey",
                          "options": {
                              "color": "0x00ff00",
                              "similarity": 0.3,
                              "blend": 0.05
                          }
                      }
                  ],
                  "area": {
                      "x": "'if(between(t,0,5),0,if(between(t,5,10),(500/5/30)*(n-150),500))'",
                      "y": "'if(gte(t,0)*lt(t,10),(H-h),if(between(t,10,12),(H-h)-(H-h-0)/2/30*(n-300),0))'"
                  }
              },
              {
                  "id": "region_3.0.0",
                  "type": "subtitles",
                  "options": {
                      "filename": "/opt/application/tx-rtcStream/files/resources/subtitles.srt",
                      "force_style": "'Fontsize=18,PrimaryColour=&H0230bf&'"
                  }
              }
          ],
          "audios": [
              {
                  "id": "audio_1.0.2",
                  "type": "audio",
                  "srcId": "src_audio_daoxiang",
                  "options": [
                      "-re",
                      "-ss 53",
                      "-t 10"
                  ],
                  "timeline": {
                      "start": 0
                  },
                  "filters": [
                      {
                          "seq": 0,
                          "name": "afade",
                          "options": {
                              "t": "out",
                              "st": "9",
                              "d": "1"
                          }
                      }
                  ]
              },
              {
                  "id": "audio_1.0.2",
                  "type": "audio",
                  "srcId": "src_audio_caihong",
                  "options": [
                      "-re",
                      "-ss 13",
                      "-t 35"
                  ],
                  "timeline": {
                      "start": 10
                  },
                  "filters": [
                      {
                          "seq": 0,
                          "name": "afade",
                          "options": {
                              "t": "in",
                              "st": "0",
                              "d": "1"
                          }
                      }
                  ]
              }
          ]
      }
  }
} as RtpRoomDTO


@Provide()
@Controller('/stream/ffmpeg', {
  tagName: '直接使用 ffmpeg 推流',
  description: '',
})
export class FfmepegController {
  @Inject('ffmpegService')
  ffmpegService: FfmpegService;

  @Post('/rtp/room', {
    summary: '通过 rtp 协议送到 rtc 房间',
    description: '',
  })
  @Validate()
  async push2RtpRoom(ctx: Context, @Body(ALL) params: RtpRoomDTO) {
    const data = await this.ffmpegService.rtpRoom(params);
    ctx.helper.success(data);
  }

  @Post('/rtc/mixer', {
    summary: 'rtc 混合器用以生成喂给 ffmpeg 的命令',
    description: '',
  })
  @Validate()
  async receiveRtcCommand(ctx: Context, @Body(ALL) params: any) {
    console.log(params);
    command.sink.roomId = params.sink.roomId;
    const data = await this.ffmpegService.rtpRoom(command);
    ctx.helper.success(data);
  }

  @Post('/rtp/command/stats', {
    summary: '获取 rtp 推流的状态',
    description: '',
  })
  @Validate()
  async getRtpStats(ctx: Context, @Body(ALL) params: { roomId: string }) {
    const data = await this.ffmpegService.getFfmpegStats(params.roomId);
    //FIXME: no response to postman
    ctx.helper.success(data);
  }


  @Post('/file', {
    summary: '通过 rtp 协议送到 rtc 房间',
    description: '',
  })
  @Validate()
  async generateLocalFile(ctx: Context, @Body(ALL) params: LocalFileDTO) {
    const data = await this.ffmpegService.localFile(params);
    ctx.helper.success(data);
  }


  @Post('/metadata', {
    summary: '获取文件或者流的元数据',
    description: '',
  })
  @Validate()
  async getMetadataOfFiles(ctx: Context, @Body(ALL) params: string[]) {
    const data = await this.ffmpegService.getMetadata(params);
    ctx.helper.success(data);
  }

}
