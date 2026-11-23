import { CreateUserDto } from './dto/create-user.dto.js';
import { UpdateUserDto } from './dto/update-user.dto.js';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  InjectDrizzle,
  eq,
  users,
  type MySql2Database,
} from '../database/index.js';

@Injectable()
export class UsersService {
  constructor(@InjectDrizzle() private readonly db: MySql2Database) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const result = await this.db.insert(users).values({
        name: createUserDto.name,
        email: createUserDto.email,
        password: createUserDto.password,
      });
      return 'User created succefully';
    } catch (error: unknown | any) {
      throw error.message;
    }
  }

  findAll() {
    return `This action returns all users`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
