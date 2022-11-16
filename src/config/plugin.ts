import { EggPlugin } from 'egg';

// 启用redis
export const redis = {
  enable: true,
  package: 'egg-redis',
};

export default {
  static: true, // default is true
  redis,
  cors: {
    enable: true,
    package: 'egg-cors',
  },
} as EggPlugin;
