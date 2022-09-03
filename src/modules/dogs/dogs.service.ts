import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DogDto } from './dto/dog.dto';
import { DogSchema } from './entity/dog.entity';

@Injectable()
export class DogsService {
  constructor(
    @InjectRepository(DogSchema)
    private dogsResponsitory: Repository<DogSchema>,
  ) {}

  findAll() {
    return this.dogsResponsitory.find({ relations: ['user'] });
  }
  findOne(id: number) {
    return this.dogsResponsitory.findOne({
      where: { id },
      relations: ['user'],
    });
  }
  create(payload: DogDto) {
    return this.dogsResponsitory.save(payload);
  }
  update(id: number, payload: Partial<DogDto>) {
    return this.dogsResponsitory.update(id, payload);
  }
  destroy(id: number) {
    return this.dogsResponsitory.delete(id);
  }
}
