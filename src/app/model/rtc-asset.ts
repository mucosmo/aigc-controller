import { EntityModel } from '@midwayjs/orm';
import { Column, PrimaryGeneratedColumn } from 'typeorm';

import { BaseModel } from './base';

@EntityModel({
  name: 'rtc_assets',
})
export class RtcAssetModel extends BaseModel {
  @PrimaryGeneratedColumn({
    type: 'bigint',
  })
  id: string;

  @Column({
    type: 'varchar',
    length: 190,
    comment: '根据文件地址生成的 md5',
  })
  md5: string;

  @Column({
    type: 'varchar',
    length: 190,
    name: 'file_type',
    comment: '文件类型',
  })
  fileType: string;

  @Column({
    type: 'varchar',
    length: 190,
    name: 'file_path',
    comment: '文件在服务其中的地址',
  })
  filePath: string;


  @Column({
    type: 'varchar',
    length: 190,
    name: 'file_url',
    comment: '文件 url 地址',
  })
  fileUrl: string;


  @Column({
    type: 'varchar',
    length: 190,
    name: 'file_name',
    comment: '文件名称',
  })
  fileName: string;

  @Column({
    type: 'json',
    name: 'metadata',
    comment: '文件元数据',
  })
  metadata: JSON;

}
