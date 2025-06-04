import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsEmail, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'Email of the user', type: String })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Password of the user', type: String })
  @IsString()
  password: string;

  @ApiProperty({ description: 'Name of the user', type: String })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Status of the user (active/inactive)',
    type: Boolean,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive: boolean = true;
}
