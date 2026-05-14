import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../common/enums/user-role.enum';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(createUserDto: RegisterDto) {
    const user = await this.usersService.create({
      ...createUserDto,
      role: UserRole.CUSTOMER,
      isActive: true,
    });

    return this.buildAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    let user: Awaited<ReturnType<UsersService['findByEmail']>>;

    try {
      user = await this.usersService.findByEmail(loginDto.email);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Invalid email or password');
      }

      throw error;
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return this.buildAuthResponse(user);
  }

  async validateUser(userId: string) {
    return this.usersService.findOne(userId);
  }

  private async buildAuthResponse(user: {
    id: string;
    email: string;
    role: UserRole;
  }) {
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);
    const profile = await this.usersService.findOne(user.id);

    return {
      accessToken,
      user: profile,
    };
  }
}
