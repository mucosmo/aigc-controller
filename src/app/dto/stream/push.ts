import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

/**
 * 流推送列表参数
 */
export class StreamPushDTO {
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
export class StreamPullDTO {
  @CreateApiPropertyDoc('数字人要加入的房间')
  @Rule(RuleType.string().trim().valid('room1', 'room2').required())
  room: string;

  @CreateApiPropertyDoc('数字人朗读的文本')
  @Rule(RuleType.string().trim().required())
  text: string;
}

