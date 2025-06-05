import { HttpStatus, INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { User } from 'generated/prisma';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { ResponseDto } from 'src/dto/response.dto';
import { PrismaExceptionFilter } from 'src/prisma/prisma-exception.filter';
import { PrismaService } from 'src/prisma/prisma.service';
import { UsersModule } from 'src/users/users.module';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Logger } from 'winston';

const loggerMock = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('Users Module E2E', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [UsersModule],
      providers: [{ provide: Logger, useValue: loggerMock }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter(app.get(Logger)));

    prisma = await app.resolve(PrismaService);

    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    await prisma.user.deleteMany();
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /users', () => {
    it('creates new user', async () => {
      const payload = {
        email: 'user@mouts.com',
        password: 'StrongP@ssw0rd!',
        name: 'User Mouts',
        isActive: true,
      };

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(HttpStatus.CREATED);

      expect(res.body).toMatchObject({
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        id: expect.any(Number),
        email: 'user@mouts.com',
        name: 'User Mouts',
        isActive: true,
      });
    });

    it('returns conflict on duplicate email', async () => {
      const payload = {
        email: 'user@mouts.com',
        password: 'StrongP@ssw0rd!',
        name: 'User Mouts',
      };

      await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(HttpStatus.CREATED);

      const res = await request(app.getHttpServer())
        .post('/users')
        .send(payload)
        .expect(HttpStatus.CONFLICT);

      expect(res.body).toMatchObject({
        statusCode: HttpStatus.CONFLICT,
        message: 'Conflict',
        path: '/users',
        method: 'POST',
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        timestamp: expect.any(String),
      });
    });
  });

  describe('GET /users', () => {
    it('returns total count and items', async () => {
      const data = Array.from({ length: 4 }).map((_, i) => ({
        email: `user${i}@mouts.com`,
        password: 'StrongP@ssw0rd!',
        name: `User ${i} Mouts`,
        isActive: i % 2 === 0,
      }));
      await prisma.user.createMany({ data });

      const res = await request(app.getHttpServer())
        .get('/users')
        .expect(HttpStatus.OK);
      const body = res.body as ResponseDto<User>;

      expect(body).toMatchObject({ total: 4 });
      expect(body.items).toHaveLength(4);
    });

    it('applies pagination parameters', async () => {
      const data = Array.from({ length: 12 }).map((_, i) => ({
        email: `user${i}@mouts.com`,
        password: 'StrongP@ssw0rd!',
        name: `User ${i} Mouts`,
        isActive: i % 2 === 0,
      }));
      await prisma.user.createMany({ data });

      const res = await request(app.getHttpServer())
        .get('/users')
        .query({ page: 1, take: 10 })
        .expect(HttpStatus.OK);

      const body = res.body as ResponseDto<User>;
      expect(body).toMatchObject({ total: 12, page: 1, take: 10 });
      expect(body.items).toHaveLength(10);
    });
  });

  describe('GET /users/:id', () => {
    it('returns a single user', async () => {
      const data = {
        email: 'user@mouts.com',
        password: 'StrongP@ssw0rd!',
        name: 'User Mouts',
        isActive: true,
      };
      const user = await prisma.user.create({ data });

      const res = await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(HttpStatus.OK);

      expect(res.body).toMatchObject({
        id: user.id,
        email: 'user@mouts.com',
        name: 'User Mouts',
        isActive: true,
      });
    });

    it('returns not found for non-existing id', async () => {
      await request(app.getHttpServer())
        .get('/users/999999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('PUT /users/:id', () => {
    it('updates name and isActive flag', async () => {
      const data = {
        email: 'user@mouts.com',
        password: 'StrongP@ssw0rd!',
        name: 'User Mouts',
        isActive: true,
      };
      const user = await prisma.user.create({ data });

      const res = await request(app.getHttpServer())
        .put(`/users/${user.id}`)
        .send({ name: 'Mouts', isActive: false })
        .expect(HttpStatus.OK);

      expect(res.body).toMatchObject({
        id: user.id,
        name: 'Mouts',
        isActive: false,
      });
    });

    it('returns not found for non-existing id', async () => {
      await request(app.getHttpServer())
        .put('/users/999999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });

  describe('DELETE /users/:id', () => {
    it('deletes and returns the removed user', async () => {
      const data = {
        email: 'user@mouts.com',
        password: 'StrongP@ssw0rd!',
        name: 'User Mouts',
        isActive: true,
      };
      const user = await prisma.user.create({ data });

      const res = await request(app.getHttpServer())
        .delete(`/users/${user.id}`)
        .expect(HttpStatus.OK);

      expect(res.body).toMatchObject({ id: user.id });

      await request(app.getHttpServer())
        .get(`/users/${user.id}`)
        .expect(HttpStatus.NOT_FOUND);
    });

    it('returns not found when deleting non-existing user', async () => {
      await request(app.getHttpServer())
        .delete('/users/999999')
        .expect(HttpStatus.NOT_FOUND);
    });
  });
});
