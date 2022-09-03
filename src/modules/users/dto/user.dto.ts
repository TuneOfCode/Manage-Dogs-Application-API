import { IsString, IsEmail, IsEmpty } from 'class-validator';
export class UserDto {
  @IsString()
  fullname: string;

  @IsString()
  @IsEmpty()
  avatar_url: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;
}
