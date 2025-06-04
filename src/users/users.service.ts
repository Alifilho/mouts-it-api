import { Injectable, Logger } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';
import { Prisma } from 'generated/prisma';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { PaginationUserDto } from './dto/pagination-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto) {
    this.logger.log(`Creating new user: ${createUserDto.email}`);

    const password = await bcryptjs.hash(createUserDto.password, 12);
    const user = await this.prisma.user.create({
      data: { ...createUserDto, password },
    });

    this.logger.log(`User created successfully: id ${user.id}`);
    return user;
  }

  async findMany(pagination?: PaginationUserDto) {
    const args = {
      select: {
        id: true,
        createdAt: true,
        updatedAt: true,
        name: true,
        email: true,
        isActive: true,
      },
    } as Prisma.UserFindManyArgs;

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
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany(args),
      this.prisma.user.count({ ...(args?.where && { where: args.where }) }),
    ]);

    return { items, total };
  }

  findUnique(id: number) {
    return this.prisma.user.findUniqueOrThrow({ where: { id } });
  }

  update(id: number, data: UpdateUserDto) {
    this.logger.log(`Updating user id: ${id}`);
    return this.prisma.user.update({ where: { id }, data });
  }

  delete(id: number) {
    this.logger.log(`Deleting user id: ${id}`);
    return this.prisma.user.delete({ where: { id } });
  }
}
