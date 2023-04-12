import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

/**
 * 从房间拉流列表参数
 */
export class StreamPullDTO {
  @CreateApiPropertyDoc('推送模式')
  @Rule(RuleType.string().valid('sync', 'async').required())
  mode: string;

  @CreateApiPropertyDoc('控制流的参数')
  @Rule(
    RuleType.object({
      type: RuleType.string().trim().required(),
      file: RuleType.object({
        format: RuleType.string().valid('pcm', 'opus', 'mp3').required(),
        name: RuleType.string().valid('file1', 'file2').required(),
      }
      ).optional(),
      mediasoup: RuleType.object(
        {
          format: RuleType.string().valid('pcm', 'opus', 'mp3').required(),
          room: RuleType.string().valid('room1', 'room2').required(),
          user: RuleType.string().valid('user1', 'user2').required(),
        }
      ).optional(),
    }).required())
  stream: object;

  @CreateApiPropertyDoc('腾讯 AsrSDK 配置')
  @Rule(RuleType.object({
    token: RuleType.optional(),
    config: RuleType.required(),
  }
  ).required())
  config: object;
}

/**
 * 拉流并推送到会议房间
 */
export class StreamPushDTO {
  @CreateApiPropertyDoc('数字人要加入的房间')
  @Rule(RuleType.string().trim().required())
  roomId: string;

  @CreateApiPropertyDoc('数字人id')
  @Rule(RuleType.string().trim().optional())
  userId: string;

  @CreateApiPropertyDoc('源流类型')
  @Rule(RuleType.string().trim().valid('file', 'live','demand','rtc').required())
  stream: string;

  @CreateApiPropertyDoc('源流地址')
  @Rule(RuleType.string().trim().required())
  path: string;

  @CreateApiPropertyDoc('数字人朗读的文本')
  @Rule(RuleType.object().required())
  dh: object;

  @CreateApiPropertyDoc('实现方式')
  @Rule(RuleType.string().trim().optional())
  deviceName: string;

  @CreateApiPropertyDoc('显示的名字')
  @Rule(RuleType.string().trim().optional())
  displayName: string;
}


/**
 * 打开 channel 用于推送流到 rtc 房间
 */
export class StreamPushOpenDTO {
  @CreateApiPropertyDoc('数字人要加入的房间')
  @Rule(RuleType.string().trim().required())
  roomId: string;

  @CreateApiPropertyDoc('数字人id')
  @Rule(RuleType.string().trim().optional())
  userId: string;

  @CreateApiPropertyDoc('数字人 peer id')
  @Rule(RuleType.string().trim().optional())
  peerId: string;

  @CreateApiPropertyDoc('是否播放音频')
  @Rule(RuleType.boolean().optional())
  audio: boolean;

  @CreateApiPropertyDoc('是否播放视频')
  @Rule(RuleType.boolean().optional())
  video: boolean;

  @CreateApiPropertyDoc('实现方式')
  @Rule(RuleType.string().trim().optional())
  deviceName: string;

  @CreateApiPropertyDoc('显示的名字')
  @Rule(RuleType.string().trim().optional())
  displayName: string;
}

export class BroadcasterStopDTO {
  @CreateApiPropertyDoc('在哪个房间停止数字人')
  @Rule(RuleType.string().trim().required())
  broadcasterId: string;
}

/**
 * 拉流并生成直播地址
 */
 export class StreamLiveDTO {
  @CreateApiPropertyDoc('目标房间')
  @Rule(RuleType.string().trim().valid('room1', 'room2').required())
  room: string;

  @CreateApiPropertyDoc('目标人员')
  @Rule(RuleType.string().trim().valid('user1', 'user2').required())
  user: string;


  @CreateApiPropertyDoc('流类型')
  @Rule(RuleType.string().trim().valid('audio', 'video', 'both').required())
  stream: string;
}

