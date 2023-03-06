import {
    Controller,
    Provide,
    Get,
    Validate,
    App
  } from '@midwayjs/decorator';
  
  import { Application, Context } from '@/interface';

  
  @Provide()
  @Controller('/rooms', {
    tagName: '房间管理',
    description: '',
  })
  export class RoomController {
    @App()
    private _app!: Application;
  
    @Get('/lists', {
      summary: '房间列表',
      description: '当前房间及其中人员列表',
    })
    @Validate()
    async getRoomLists(ctx: Context) {
      const url = "https://chaosyhy.com:4443/rooms/lists"
      const result = await this._app.curl(url, {
        method: 'GET',
        dataType: 'json',
        headers: {
          'content-type': 'application/json',
        },
      });
      ctx.helper.success(result.data);
    }
  
  }
  