
import { Provide, Inject, } from '@midwayjs/decorator';

import { Context, } from '@/interface';

import { FfmpegService } from '../stream/ffmpeg';



import fs from 'fs';
import path from 'path';
import moment from 'moment';

import crypto from 'crypto';

const FILE_SERVER_FOLDER = process.env.FILE_SERVER_FOLDER;
const FILE_SERVER_URL=process.env.FILE_SERVER_URL;

@Provide()
export class AigcUploadService {
    @Inject()
    ctx: Context;

    @Inject('ffmpegService')
    ffmpegService: FfmpegService;

    async save(params) {
        const { user, file } = params;
        const fileData = Buffer.from(file.data);

        const fileName = path.basename(file.name);
        const uploadFolder = path.join(FILE_SERVER_FOLDER, user.tenant, user.name);

        if (!fs.existsSync(uploadFolder)) {
            fs.mkdirSync(uploadFolder, { recursive: true });
        }

        const uniqueSuffix = moment().format('YYMMDD_HHmmss') + '_' + crypto.createHash('md5').update(fileName + Math.round(Math.random() * 1E9)).digest('hex').slice(0, 10);
        const filePath = path.join(uploadFolder, uniqueSuffix + path.extname(file.name));

        fs.writeFileSync(filePath, fileData);

        const url = filePath.replace(FILE_SERVER_FOLDER, FILE_SERVER_URL);

        let duration = 0;

        try {
            const metadata = await this.ffmpegService.asyncFfprobe(filePath) as { format: { duration: number } };
            duration = metadata.format.duration;
            if (!(duration > 0.1)) {
                duration = undefined
            }
        } catch (err) {
            console.error(err)
        }

        return { path: filePath, url, duration };
    }



}

