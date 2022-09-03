import { UserSchema } from 'src/modules/users/entity/user.entity';

export interface IDog {
  id: number | string;
  name: string;
  age: number;
  image: null | string;
  user: UserSchema;
}
