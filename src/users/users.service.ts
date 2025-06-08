import { Injectable, Logger } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { Prisma, User } from 'generated/prisma';
import { FindManyDto } from 'src/dto/response.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { RedisService } from 'src/redis/redis.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationUserDto } from './dto/pagination-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const select = {
  id: true,
  createdAt: true,
  updatedAt: true,
  name: true,
  email: true,
  isActive: true,
};

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly redis: RedisService,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating new user: ${createUserDto.email}`);

    const password = await bcryptjs.hash(createUserDto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password },
      select,
    });

    this.logger.log(`User created successfully: id ${user.id}`);

    await this.redis.delByPrefix('users:all');
    return user;
  }

  async findMany(pagination?: PaginationUserDto) {
    const args = { select } as Prisma.UserFindManyArgs;

    let cacheKey = 'users:all';
    if (pagination) {
      const { page, take, sortBy, order, email, name, isActive } = pagination;

      args.skip = page && take ? (page - 1) * take : undefined;
      args.take = take || undefined;
      args.orderBy = (sortBy && order && { [sortBy]: order }) || undefined;
      args.where = {
        ...(email && { email }),
        ...(name && { name }),
        ...(isActive && { isActive }),
      };

      cacheKey = `users:all:page=${page}&take=${take}&sortBy=${sortBy}&order=${order}&email=${email}&name=${name}&isActive=${isActive}`;
    }

    const cached = await this.redis.get<FindManyDto<User>>(cacheKey);
    if (cached) return cached;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany(args),
      this.prisma.user.count({ ...(args?.where && { where: args.where }) }),
    ]);

    const result = { items, total };
    await this.redis.set(cacheKey, result);

    return result;
  }

  async findUnique(id: number) {
    const key = `users:id:${id}`;
    const cached = await this.redis.get<User>(key);
    if (cached) return cached;

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id },
      select,
    });

    await this.redis.set(key, user);
    return user;
  }

  findByEmail(email: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { email },
      select: { id: true, password: true, isActive: true },
    });
  }

  async update(id: number, data: UpdateUserDto) {
    this.logger.log(`Updating user id: ${id}`);

    await this.redis.del(`users:id:${id}`);
    await this.redis.delByPrefix('users:all');

    if (data.password) {
      data.password = await bcryptjs.hash(data.password, 12);
    }

    return this.prisma.user.update({ where: { id }, data, select });
  }

  async delete(id: number) {
    this.logger.log(`Deleting user id: ${id}`);

    await this.redis.del(`users:id:${id}`);
    await this.redis.delByPrefix('users:all');
    return this.prisma.user.delete({ where: { id }, select });
  }
}
