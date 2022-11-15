import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

/**
 * 流推送列表参数
 */
export class StreamPushDTO {
  @CreateApiPropertyDoc('控制流的参数')
  @Rule(
    RuleType.object({
      mode: RuleType.string().trim().valid('sync', 'async').required(),
      format: RuleType.string().trim().valid('opus', 'pcm', 'mp3').required(),
      room: RuleType.string().trim().valid('room1', 'room2').required(),
      user: RuleType.string().trim().valid('user1', 'user2').required(),
    }))
  stream: object;

  @CreateApiPropertyDoc('腾讯 AsrSDK 配置')
  @Rule(RuleType.object().optional())
  asrConfig?: object;
}

