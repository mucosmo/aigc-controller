import { Rule, RuleType } from '@midwayjs/decorator';

import { CreateApiPropertyDoc } from '@midwayjs/swagger';

import { StreamPushOpenDTO } from './push';

/**
 * 拉流并推送到会议房间
 */
export class RtpRoomDTO {
  @CreateApiPropertyDoc('数字人要加入的房间')
  @Rule(RuleType.object().required())
  sink: StreamPushOpenDTO;

  @CreateApiPropertyDoc('流选择')
  @Rule(RuleType.array().optional())
  streams: Array<string>;

  @CreateApiPropertyDoc('命令参数')
  @Rule(RuleType.object({
    globalOptions: RuleType.optional(),
    template: RuleType.required(),
    srcs: RuleType.required(),
    outputOptions: RuleType.optional(),
  }
  ).required())
  render: object;
}

