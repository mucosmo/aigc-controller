import { Rule, RuleType } from '@midwayjs/decorator';

import { CreateApiPropertyDoc } from '@midwayjs/swagger';

export class UploadFileDTO {
    @CreateApiPropertyDoc('用户')
    @Rule(RuleType.object(
        {
            tenant: RuleType.string().required(),
            name: RuleType.string().required(),
        }
    ).required())
    user: object;

    @CreateApiPropertyDoc('文件')
    @Rule(RuleType.object(
        {
            name: RuleType.string().required(),
            data: RuleType.binary().required(),
        }
    ).required())
    file: object;
}