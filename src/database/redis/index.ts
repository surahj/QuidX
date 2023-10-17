import { Redis } from 'ioredis';
import * as dotenv from 'dotenv';

dotenv.config();
export default class RedisClient {
  constructor(public client = new Redis(process.env.REDIS_URL)) {}

  public async set(key: string, value: string, expire: number) {
    await this.client.set(key, value, 'EX', expire);
  }

  public async get(key: string) {
    return await this.client.get(key);
  }

  public async del(key: string) {
    return await this.client.del(key);
  }

  public async exists(key: string): Promise<number> {
    return await this.client.exists(key);
  }

  public async connect() {
    await this.client.connect();
  }

  public async disconnect() {
    await this.client.disconnect();
  }

  public getClient() {
    return this.client;
  }

  public async sadd(key: string, member: string | number | Buffer) {
    await this.client.sadd(key, member);
  }

  public async sismember(key: string, member: string | number | Buffer) {
    return (await this.client.sismember(key, member)) === 1;
  }
}
