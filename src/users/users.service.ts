import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { UserRole } from '../common/enums/user-role.enum';
import { getPaginationData } from '../utils/getPaginationData';
import { applyExactFilters, applySearch } from '../utils/search.util';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    createUserDto: CreateUserDto & {
      role?: UserRole;
      isActive?: boolean;
    },
  ) {
    await this.ensureEmailIsUnique(createUserDto.email);

    const password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepository.create({
      ...createUserDto,
      password,
    });

    return this.usersRepository.save(user);
  }

  async findAll(query: QueryUsersDto) {
    const { page, limit, search, role, isActive } = query;
    const queryBuilder = this.usersRepository.createQueryBuilder('user');

    applySearch(queryBuilder, 'user', search, [
      'firstName',
      'lastName',
      'email',
      'phone',
    ]);
    applyExactFilters(queryBuilder, 'user', { role, isActive });

    queryBuilder.orderBy('user.createdAt', 'DESC');
    queryBuilder.skip((page - 1) * limit).take(limit);

    const [items, totalItems] = await queryBuilder.getManyAndCount();

    return {
      items,
      meta: getPaginationData(totalItems, page, limit),
    };
  }

  async findOne(id: string) {
    const user = await this.usersRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findByEmail(email: string) {
    const user = await this.usersRepository
      .createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id);

    if (updateUserDto.email && updateUserDto.email !== user.email) {
      await this.ensureEmailIsUnique(updateUserDto.email);
    }

    let password = user.password;
    if (updateUserDto.password) {
      password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, {
      ...updateUserDto,
      password,
    });

    return this.usersRepository.save(user);
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.usersRepository.softDelete(id);

    return { message: 'User deleted successfully' };
  }

  private async ensureEmailIsUnique(email: string) {
    const existingUser = await this.usersRepository.findOne({ where: { email } });

    if (existingUser) {
      throw new ConflictException('Email is already in use');
    }
  }
}
