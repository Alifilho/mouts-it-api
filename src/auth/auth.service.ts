import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from 'src/users/users.service';
import { SignInDto } from './dto/sign-in.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly logger: Logger,
  ) {}

  async signIn(data: SignInDto) {
    this.logger.log(`Sign-in attempt for user: ${data.email}`);

    let user: { id: number; password: string; isActive: boolean };
    try {
      user = await this.usersService.findByEmail(data.email);
      if (!user.isActive) throw new UnauthorizedException('User is not active');
    } catch {
      this.logger.warn(
        `Failed sign-in attempt: user not found - ${data.email}`,
      );
      throw new UnauthorizedException();
    }

    if (!user.isActive) {
      this.logger.warn(`Failed sign-in attempt: user inactive - ${data.email}`);
      throw new UnauthorizedException();
    }

    const isValid = await bcrypt.compare(data.password, user.password);
    if (!isValid) {
      this.logger.warn(
        `Failed sign-in attempt: invalid password for ${data.email}`,
      );
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`Successful sign-in for user id: ${user.id}`);
    return { accessToken: await this.jwtService.signAsync({ sub: user.id }) };
  }
}
