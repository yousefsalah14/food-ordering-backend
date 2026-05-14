import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator';

export class CreateCartDto {
  @ApiProperty({ example: 'd290f1ee-6c54-4b01-90e6-d701748f0851' })
  @IsUUID()
  productId!: string;

  @ApiProperty({ example: 1, default: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  quantity = 1;
}
