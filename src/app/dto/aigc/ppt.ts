import { Rule, RuleType } from '@midwayjs/decorator';

import { CreateApiPropertyDoc } from '@midwayjs/swagger';

 

export class TimelineDTO {
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

