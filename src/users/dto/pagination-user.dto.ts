import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { PaginationDto } from 'src/dto/pagination.dto';

export class PaginationUserDto extends PaginationDto {
  @ApiProperty({
    description: 'Email of the user to filter by',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  email?: string;

  @ApiProperty({
    description: 'Name of the user to filter by',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Active status filter',
    required: false,
    type: Boolean,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true')
  isActive?: boolean;
}
