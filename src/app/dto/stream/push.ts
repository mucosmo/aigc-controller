import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

/**
 * 流推送列表参数
 */
export class StreamPushDTO {
  @CreateApiPropertyDoc('控制流的参数')
  @Rule(
    RuleType.object({
      type: RuleType.string().trim().required(),
      file: RuleType.object().optional(),
      mediasoup: RuleType.object().optional(),
    }))
  stream: object;

  @CreateApiPropertyDoc('腾讯 AsrSDK 配置')
  @Rule(RuleType.string().valid('sync', 'async').required())
  mode: string;

  @CreateApiPropertyDoc('腾讯 AsrSDK 配置')
  @Rule(RuleType.object().required())
  config: object;
}

/**
 * 获取单个管理员参数
 */
 export class ShowDTO {
  @CreateApiPropertyDoc('管理员的id')
  @Rule(RuleType.string().trim().max(10).required())
  id: string;
}

