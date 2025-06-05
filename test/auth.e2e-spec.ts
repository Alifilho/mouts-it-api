import {
  Controller,
  Get,
  HttpStatus,
  INestApplication,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcryptjs';
import { AuthModule } from 'src/auth/auth.module';
import { AuthService } from 'src/auth/auth.service';
import { jwtConstants } from 'src/auth/constants';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { Public } from 'src/auth/public.decorator';
import { PrismaExceptionFilter } from 'src/prisma/prisma-exception.filter';
import { PrismaService } from 'src/prisma/prisma.service';
import * as request from 'supertest';
import { App } from 'supertest/types';
import { Logger } from 'winston';

const MOCK_PASSWORD = '12345';
const MOCK_EMAIL = 'user@mouts.com';

@UseGuards(JwtAuthGuard)
@Controller('protected')
class ProtectedController {
  @Get('get-thing')
  withAuth() {
    return { thing: true };
  }

  @Public()
  @Get('public')
  publicRoute() {
    return 'ok!';
  }
}

const loggerMock = {
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  debug: jest.fn(),
  verbose: jest.fn(),
};

describe('Auth Module E2E', () => {
  let app: INestApplication<App>;
  let prisma: PrismaService;
  let jwtService: JwtService;
  let authService: AuthService;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AuthModule],
      controllers: [ProtectedController],
      providers: [{ provide: Logger, useValue: loggerMock }],
    }).compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    app.useGlobalFilters(new PrismaExceptionFilter(app.get(Logger)));

    jwtService = app.get(JwtService);
    authService = await app.resolve(AuthService);
    prisma = await app.resolve(PrismaService);

    await app.init();
  });
  afterAll(async () => {
    await app.close();
  });

  beforeEach(async () => {
    const data = {
      name: 'User Mouts',
      email: MOCK_EMAIL,
      password: await bcrypt.hash(MOCK_PASSWORD, 12),
    };
    await prisma.user.create({ data });
  });
  afterEach(async () => {
    await prisma.user.deleteMany();
  });

  describe('POST /auth/sign-in', () => {
    it('signs in and returns accessToken', async () => {
      const res = await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: MOCK_EMAIL, password: MOCK_PASSWORD })
        .expect(HttpStatus.OK);

      const body = res.body as { accessToken: string };
      expect(body).toHaveProperty('accessToken');
    });

    it('returns unauthorized when password is incorrect', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: MOCK_EMAIL, password: 'wrong' })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns unauthorized when user is inactive', async () => {
      await prisma.user.update({
        where: { email: MOCK_EMAIL },
        data: { isActive: false },
      });

      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: MOCK_EMAIL, password: MOCK_PASSWORD })
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('returns unauthorized when email is not found', async () => {
      await request(app.getHttpServer())
        .post('/auth/sign-in')
        .send({ email: 'noone@nowhere.com', password: 'anything' })
        .expect(HttpStatus.UNAUTHORIZED);
    });
  });

  describe('AuthGuard (Protected Routes)', () => {
    it('allows access to public endpoints without a token', async () => {
      await request(app.getHttpServer())
        .get('/protected/public')
        .expect(HttpStatus.OK, 'ok!');
    });

    it('rejects requests with missing, malformed, or expired tokens', async () => {
      const { accessToken } = await authService.signIn({
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      });
      const invalidToken = await jwtService.signAsync(
        { sub: 0, tenantId: 0 },
        { secret: 'invalid secret' },
      );
      const expiredToken = await jwtService.signAsync(
        { sub: 0, tenantId: 0 },
        { expiresIn: '-1', secret: jwtConstants.secret },
      );

      // no Authorization header
      await request(app.getHttpServer())
        .get('/protected/get-thing')
        .expect(HttpStatus.UNAUTHORIZED);
      // missing "Bearer "
      await request(app.getHttpServer())
        .get('/protected/get-thing')
        .set('Authorization', accessToken)
        .expect(HttpStatus.UNAUTHORIZED);
      // bad signature
      await request(app.getHttpServer())
        .get('/protected/get-thing')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
      // expired
      await request(app.getHttpServer())
        .get('/protected/get-thing')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(HttpStatus.UNAUTHORIZED);
    });

    it('allows access to protected endpoints with a valid token', async () => {
      const { accessToken } = await authService.signIn({
        email: MOCK_EMAIL,
        password: MOCK_PASSWORD,
      });

      const res = await request(app.getHttpServer())
        .get('/protected/get-thing')
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.OK);

      expect(res.body).toEqual({ thing: true });
    });
  });
});
