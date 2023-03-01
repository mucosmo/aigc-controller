
import { Provide, Inject, App } from '@midwayjs/decorator';

import { Context, Application } from '@/interface';

import { CreateDhDTO, DriveDhDTO } from '../../dto/stream/dh';

@Provide()
export class DigitalHumanService {
  @Inject()
  ctx: Context;

  @App()
  private _app!: Application;


  /**create digital human resouce */
  async createDh(params: CreateDhDTO) {
    const sessionId = `${Math.random().toString(36).slice(2)}${Math.random().toString(36).slice(2)}`
    const body1 = {
      sessionId,
      supplier: params.supplier || 'tencentNew',
      protocol: params.protocol || 'rtmp' // valid('rtsp','rtmp','flv')
    }
    const serverHttp1 = "https://hz-test.ikandy.cn:60106/ipaas-oauth/dh/init"
    const result = await this._app.curl(serverHttp1, {
      method: 'POST',
      data: body1,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    return result.data.data;
  }

  /**drive dh to read text */
  async driveDh(data: DriveDhDTO) {
    const url = "https://hz-test.ikandy.cn:60106/ipaas-oauth/dh/command"
    const result = await this._app.curl(url, {
      method: 'POST',
      data,
      dataType: 'json',
      headers: {
        'content-type': 'application/json',
      },
    });
    return result.data;
  }

}