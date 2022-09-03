import { UserSchema } from 'src/modules/users/entity/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IDog } from '../interfaces/dog.interface';

@Entity({ name: 'dogs' })
export class DogSchema implements IDog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  age: number;

  @Column({ nullable: true })
  image: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @ManyToOne(() => UserSchema, (user) => user.dogs, { cascade: true })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: UserSchema;
}
