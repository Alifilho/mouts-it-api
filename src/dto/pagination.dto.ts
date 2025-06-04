import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString } from 'class-validator';

enum PaginationOrder {
  ASC = 'asc',
  DESC = 'desc',
}

export class PaginationDto {
  @ApiProperty({ description: 'Page number', required: false, type: Number })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page: number = 0;

  @ApiProperty({
    description: 'Number of items per page',
    required: false,
    enum: [10, 25, 50, -1],
  })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  take: number = 25;

  @ApiProperty({
    description: 'Prop to sort by',
    required: false,
    type: String,
  })
  @IsOptional()
  @IsString()
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Order to prop to sort by',
    required: false,
    enum: PaginationOrder,
  })
  @IsOptional()
  order?: string = PaginationOrder.DESC;
}
