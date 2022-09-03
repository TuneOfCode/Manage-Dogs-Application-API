import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserDto } from './dto/user.dto';
import { UserSchema } from './entity/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserSchema)
    private userRepository: Repository<UserSchema>,
  ) {}

  findAll() {
    return this.userRepository.find();
  }
  create(payload: UserDto) {
    return this.userRepository.save(payload);
  }
  findByEmail(email: string) {
    return this.userRepository.findOne({ where: { email } });
  }
  findById(id: number) {
    return this.userRepository.findOne({ where: { id } });
  }
  update(id: number | string, payload: any) {
    return this.userRepository.update(id, payload);
  }
  async updateByEmail(email: string, payload: any) {
    const user = await this.findByEmail(email);
    return this.userRepository.update(user.id, payload);
  }
  destroy(id: number) {
    return this.userRepository.delete(id);
  }
}
