
import { Provide, Inject } from '@midwayjs/decorator';
import { InjectEntityModel } from '@midwayjs/orm';
import { Repository } from 'typeorm';

import { Context } from '@/interface';

import { AdminUserModel } from '../../model/admin-user';


@Provide()
export class StreamPushService {
  @Inject()
  ctx: Context;

  @InjectEntityModel(AdminUserModel)
  adminUserModel: Repository<AdminUserModel>;


  avFilterGraph(params: any) {
    const filter = `movie=/opt/application/tx-rtcStream/files/resources/${params.img0}[m0];movie=/opt/application/tx-rtcStream/files/resources/mask.png[m1];movie=/opt/application/tx-rtcStream/files/resources/${params.video2}[m2];movie=/opt/application/tx-rtcStream/files/resources/${params.img3}[m3];movie=/opt/application/tx-rtcStream/files/resources/${params.video4}[m4];[m0]crop=200:200:200:200[cropped1];[m1]alphaextract[amask];[amask]scale=150:150[vmask];[m2]scale=150:150[cropped3];[cropped3][vmask]alphamerge[avatar];[in][cropped1]overlay=W-w-10:10[ov1];[ov1][avatar]overlay=100:10[ov2];[m3]scale=50:50[gif];[ov2][gif]overlay=W-w-10:H/2[ov3];[m4]scale=200:300,chromakey=0x00ff00:0.3:0.05[ov4];[ov3][ov4]overlay=${params.dh.x}:${params.dh.y}[ov5];[ov5]subtitles=/opt/application/tx-rtcStream/files/resources/subtitles.srt[final];[final]drawtext=text=${params.drawtext.text}:fontfile=/usr/share/fonts/chinese/SIMKAI.TTF:x=${params.drawtext.x}:y=${params.drawtext.y}:fontcolor=${params.drawtext.color}:fontsize=${params.drawtext.fontsize}:shadowx=2:shadowy=2`

    return filter;
  }


}