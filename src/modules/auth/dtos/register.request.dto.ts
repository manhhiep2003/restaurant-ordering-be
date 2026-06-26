import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class RegisterRequestDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username used for authentication.',
  })
  @IsString()
  @Length(3, 10)
  @IsNotEmpty()
  @Matches(/^[a-z0-9]+$/, {
    message: 'Username can only contain lowercase letters and numbers',
  })
  username: string;

  @ApiProperty({
    example: 'johndoe@',
    description: 'Password used for authentication.',
  })
  @IsString()
  @Length(6, 12)
  @IsNotEmpty()
  password: string;

  @ApiProperty({
    example: 'Doan Manh Hiep',
    description: 'Full name.',
  })
  @IsString()
  @IsNotEmpty()
  @Length(5, 50)
  fullName: string;
}
