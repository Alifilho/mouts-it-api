import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import { Cache } from 'cache-manager';
import { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  async get<T>(key: string) {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T) {
    return this.cache.set(key, value);
  }

  async del(key: string) {
    await this.cache.del(key);
  }

  async delByPrefix(prefix: string) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access
    const store: RedisClientType = await this.cache.stores[0].store.getClient();
    const keys = await store.keys(`${prefix}*`);

    await Promise.all(keys.map((key) => this.del(key)));
  }
}
