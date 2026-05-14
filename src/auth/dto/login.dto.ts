import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'admin@gmail.com' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: 'admin' })
  @IsString()
  @IsNotEmpty()
  password!: string;
}
