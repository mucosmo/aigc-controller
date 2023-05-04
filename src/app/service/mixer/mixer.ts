
import { Provide } from '@midwayjs/decorator';

import { RtpRoomDTO } from '../../dto/stream/ffmpeg';

import fs from 'fs';



@Provide()
export class MixerService {
    async transformer(params: any) {
        const command = JSON.parse(fs.readFileSync('/opt/application/command_scene001.json', 'utf8')) as RtpRoomDTO

        const scenes = params.script.scenes;
        const size = params.script.meta.size;
        command.sink.roomId = params.sink.roomId;
        console.log('---- size', size);
        console.log('---- scenes', scenes);
        return command;
    }
}
