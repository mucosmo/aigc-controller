import { Rule, RuleType } from '@midwayjs/decorator';

import { CreateApiPropertyDoc } from '@midwayjs/swagger';

import { StreamPushOpenDTO } from './push';

/**which stream should be choosed */
export class StreamsEnableDTO {
  @CreateApiPropertyDoc('流选择')
  @Rule(RuleType.boolean().optional())
  video: boolean;

  @Rule(RuleType.boolean().optional())
  audio: boolean;


}

/**
 * 拉流并推送到会议房间
 */
export class RtpRoomDTO {
  @CreateApiPropertyDoc('数字人要加入的房间')
  @Rule(RuleType.object().required())
  sink: StreamPushOpenDTO;

  @CreateApiPropertyDoc('流选择')
  @Rule(RuleType.object().required())
  streams: StreamsEnableDTO;

  @CreateApiPropertyDoc('合成参数')
  @Rule(RuleType.object({
    globalOptions: RuleType.optional(),
    template: RuleType.required(),
    srcs: RuleType.required(),
    outputOptions: RuleType.optional(),
  }
  ).required())
  render: object;
}


class FileSinkDTO {
  @CreateApiPropertyDoc('文件名')
  @Rule(RuleType.string().required())
  path: string;
}

export class LocalFileDTO {
  @CreateApiPropertyDoc('文件生成路径')
  @Rule(RuleType.object().required())
  sink: FileSinkDTO;

  @CreateApiPropertyDoc('流选择')
  @Rule(RuleType.object().required())
  streams: StreamsEnableDTO;

  @CreateApiPropertyDoc('合成参数')
  @Rule(RuleType.object({
    globalOptions: RuleType.optional(),
    template: RuleType.required(),
    srcs: RuleType.required(),
    outputOptions: RuleType.optional(),
  }
  ).required())
  render: object;
}

