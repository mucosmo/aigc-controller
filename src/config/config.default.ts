import { EggAppInfo } from 'egg';
import { ConnectionOptions } from 'typeorm';

import { DefaultConfig } from './config.types';

/**
 * 关于环境变量的配置，请查阅文档：https://www.yuque.com/midwayjs/midway_v2/eggjs#0JHun
 */
export default (appInfo: EggAppInfo): DefaultConfig => {
  const config = {} as DefaultConfig;

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1602294995416_4568';

  // add your config here
  config.middleware = ['jwtAuth'];

  config.midwayFeature = {
    // true 使用 midway-logger
    // false 或空代表使用 egg-logger
    replaceEggLogger: true,
  };

  // 默认管理员
  config.admin = {
    username: 'admin',
    password: 'admin',
  };

  // 数据库配置
  config.orm = {
    type: 'mysql',
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: process.env.MYSQL_PORT || 3306,
    username: process.env.MYSQL_USER || '',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || undefined,
    synchronize: false,
    logging: true,
    timezone: '+08:00',
  } as ConnectionOptions;

  // redis配置
  config.redis = {
    client: {
      port: +process.env.REDIS_PORT || 6379, // Redis port
      host: process.env.REDIS_HOST || '127.0.0.1', // Redis host
      password: process.env.REDIS_PASSWORD || '',
      db: +process.env.REDIS_DB || 0,
    },
  };

  // swagger文档配置，默认地址 http://127.0.0.1:7001/swagger-ui/index.html
  config.swagger = {
    title: 'streamPipeline',
    description: 'streamPipeline工程的接口定义',
    version: '0.0.1',
    contact: {
      name: 'huanyu.yang',
      email: 'mfuture@qq.com',
    },
  };

  // snowflake id generator config
  // '2020-01-01T00:00:00Z'
  const epoch = 1577836800000;
  config.koid = {
    dataCenter: 0,
    worker: 0,
    epoch,
  };

  // rabbitmq 基本配置 默认管理界面 http://127.0.0.1:15672/ (这个项目只包含生产者的代码)
  config.rabbitmq = {
    url: process.env.RABBITMQ_URL || 'amqp://localhost',
  };

  return config;
};
