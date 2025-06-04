import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
  @ApiProperty({ description: 'Email of the user', type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password of the user', type: String })
  @IsString()
  password: string;
}
