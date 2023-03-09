import { Rule, RuleType } from '@midwayjs/decorator';
import { CreateApiPropertyDoc } from '@midwayjs/swagger';

/**
 * 创建数字人
 */
export class AssetsListsDTO {
  @CreateApiPropertyDoc('会话id')
  @Rule(RuleType.string().valid('RTC','images','videos','audios','subtitles').required())
  type: string;

 
}


 

