import { IsString } from 'class-validator';

export class ChangePasswordDto {
  @IsString()
  old_password: string;

  @IsString()
  new_password: string;

  @IsString()
  confirm_password: string;
}
