import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';


/**
 * 拉流并推送到会议房间
 */
export class RtpRoomDTO {
  @CreateApiPropertyDoc('数字人要加入的房间')
  @Rule(RuleType.string().trim().valid('room1', 'room2').optional())
  room: string;

  @CreateApiPropertyDoc('实现方式')
  @Rule(RuleType.string().trim().optional())
  deviceName: string;

  @CreateApiPropertyDoc('显示的名字')
  @Rule(RuleType.string().trim().optional())
  displayName: string;

  @CreateApiPropertyDoc('命令参数')
  @Rule(RuleType.object({
    globalOptions:RuleType.required(),
    background: RuleType.required(),
    template: RuleType.required(),
    srcs: RuleType.required(),
    outputOptions:RuleType.optional(),

  }
  ).required())
  params: object;
}

