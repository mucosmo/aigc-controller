
import { Provide, Inject, } from '@midwayjs/decorator';

import { Context, } from '@/interface';

import { FfmpegService } from '../stream/ffmpeg';



import fs from 'fs';
import path from 'path';
import moment from 'moment';

import crypto from 'crypto';


@Provide()
export class AigcUploadService {
    @Inject()
    ctx: Context;

    @Inject('ffmpegService')
    ffmpegService: FfmpegService;

    async save(params) {
        const { user, file } = params;
        const fileData = Buffer.from(file.data);

        const staticPath = '/opt/application';
        const host = 'https://chaosyhy.com:60125';
        const fileName = path.basename(file.name);
        const uploadFolder = path.join(staticPath, '/data/aigc/', user.tenant, user.name);
        const uniqueSuffix = moment().format('YYMMDD_HHmmss') + '_' + crypto.createHash('md5').update(fileName + Math.round(Math.random() * 1E9)).digest('hex').slice(0, 10);
        const filePath = path.join(uploadFolder, uniqueSuffix + path.extname(file.name));

        fs.writeFileSync(filePath, fileData);

        const url = filePath.replace(staticPath, host);

        const metadata = await this.ffmpegService.asyncFfprobe(filePath) as { format: { duration: number } };
        let duration = metadata.format.duration;
        if (!(duration > 0.1)) {
            duration = undefined
        }
        return { path: filePath, url, duration };
    }



}

