import { Rule, RuleType } from '@midwayjs/decorator';

import { CreateApiPropertyDoc } from '@midwayjs/swagger';



export class TimelineDataDTO {
  @CreateApiPropertyDoc('视频轨道')
  @Rule(RuleType.array().required())
  VideoTracks: object;

  @CreateApiPropertyDoc('音频轨道')
  @Rule(RuleType.array().required())
  AudioTracks: object;

  @CreateApiPropertyDoc('字幕轨道')
  @Rule(RuleType.array().required())
  SubtitleTracks: object;
}


export class TimelineUserDTO {
  @CreateApiPropertyDoc('租户名')
  @Rule(RuleType.string().required())
  tenant: string;

  @CreateApiPropertyDoc('用户名')
  @Rule(RuleType.string().required())
  name: string;


  @CreateApiPropertyDoc('时长')
  @Rule(RuleType.number().optional())
  duration: number;

}


export class TimelineDTO {
  @CreateApiPropertyDoc('ppt 数据结构')
  @Rule(RuleType.object().required())
  asset: TimelineDataDTO;

  @CreateApiPropertyDoc('音频轨道')
  @Rule(RuleType.object().required())
  user: TimelineUserDTO;
}

class FileDTO {
  @CreateApiPropertyDoc('ppt 数据结构')
  @Rule(RuleType.string().required())
  path: string;

}


export  class PptToImageDTO {

  @CreateApiPropertyDoc('文件路径')
  @Rule(RuleType.object().required())
  file: FileDTO;

  @CreateApiPropertyDoc('用户信息')
  @Rule(RuleType.object().required())
  user: TimelineUserDTO;

  @CreateApiPropertyDoc('回调地址')
  @Rule(RuleType.string().required())
  callback: string;
}

