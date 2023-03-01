import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

/**
 * 创建数字人
 */
export class CreateDhDTO {
  @CreateApiPropertyDoc('会话id')
  @Rule(RuleType.string().optional())
  sessionId: string;

  @CreateApiPropertyDoc('供应商名称')
  @Rule(RuleType.string().required())
  supplier: string;

  @CreateApiPropertyDoc('流协议')
  @Rule(RuleType.string().required())
  protocol: string;
}


/**
 * 驱动数字人朗读文本
 */
export class DriveDhDTO {
  @CreateApiPropertyDoc('数字人topic')
  @Rule(RuleType.string().required())
  topic: string;

  @CreateApiPropertyDoc('朗读的文本')
  @Rule(RuleType.string().required())
  text: string;
}



