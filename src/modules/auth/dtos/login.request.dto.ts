import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class LoginRequestDto {
  @ApiProperty({
    example: 'johndoe',
    description: 'Username used for authentication.',
  })
  @IsString()
  @Length(3, 10)
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
  password: string;
}
