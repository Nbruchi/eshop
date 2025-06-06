import { Redis } from 'ioredis';

const redis = new Redis(process.env.REDIS_DATABASE_URI!);
// const redis = new Redis({
//   url: process.env.REDIS_URL,
//   token: process.env.REDIS_TOKEN,
// });

export default redis;
