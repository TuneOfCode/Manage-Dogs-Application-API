import { IsEmpty, IsNumber, IsObject, IsString } from 'class-validator';
import { UserSchema } from 'src/modules/users/entity/user.entity';

export class DogDto {
  @IsString()
  name: string;

  @IsNumber()
  age: number;

  @IsEmpty()
  @IsString()
  image: string | null;

  @IsObject()
  user: UserSchema;
}
