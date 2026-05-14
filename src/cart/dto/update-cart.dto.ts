import { ApiProperty } from '@nestjs/swagger';
import { IsInt, Max, Min } from 'class-validator';

export class UpdateCartDto {
  @ApiProperty({ example: 3 })
  @IsInt()
  @Min(1)
  @Max(100)
  quantity!: number;
}
