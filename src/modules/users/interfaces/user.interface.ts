import { Role } from 'src/constants';

export interface IUser {
  id: number | string;
  fullname: string;
  avatar_url: null | string;
  email: string;
  password: string;
  role: Role;
}
