import {
  Controller,
  Provide,
  Post,
  Validate,
  Inject,
  Body,
  ALL
} from '@midwayjs/decorator';

import { Context } from '@/interface';

import { RoomService } from '../../service/room/room';



@Provide()
@Controller('/rooms', {
  tagName: '房间管理',
  description: '',
})
export class RoomsController {
  @Inject('roomService')
  roomService: RoomService;

  @Post('/stats', {
    summary: '房间信息',
    description: '',
  })
  @Validate()
  async getRoomInof(ctx: Context) {
    const data = await this.roomService.getRoomStats();
    ctx.helper.success(data);
  }

  @Post('/dh/join', {
    summary: '数字人加入',
    description: '',
  })
  @Validate()
  /**new dh peer start by ffmpeg get in*/
  async newDhPeer(ctx: Context, @Body(ALL) params: { roomId: string, peerId: string }) {
    const { roomId, peerId } = params;
    const data = await this.roomService.newDhPeer(roomId, peerId);
    ctx.helper.success(data);
  }


  @Post('/dh/leave', {
    summary: '数字人离开',
    description: '',
  })
  @Validate()
  /**new dh peer start by ffmpeg get in*/
  async deleteDhPeer(ctx: Context, @Body(ALL) params: { roomId: string, peerId: string }) {
    const { roomId, peerId } = params;
    const data = await this.roomService.deleteDhPeer(roomId, peerId);
    ctx.helper.success(data);
  }

}




