import { Injectable } from '@nestjs/common';
import { ModuleConnectors } from '../../shared/infrastructure/moduleConnectors';
import { PasswordService } from '../../shared/utils/password.service';
import { JwtService } from '@nestjs/jwt';
import UserInfoDto from '../domain/userInfoDto';
import { TOKEN_EXPIRES_IN_SECONDS, TOKEN_TYPE } from '../config';
import ms from 'ms';

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface LoginRequest {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
}

@Injectable()
export class AuthService {
  constructor(
    private moduleConnectors: ModuleConnectors,
    private passwordService: PasswordService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<UserInfoDto> {
    const user = await this.moduleConnectors.obtainUserInformation(email);
    if (!user) {
      throw new Error('invalid email');
    }
    const valid = await this.passwordService.comparePasswords(
      password,
      user.toPrimitives().password,
    );
    if (!valid) {
      throw new Error('invalid password');
    }
    return UserInfoDto.fromPrimitives(user.toPrimitives());
  }

  async login(user: LoginRequest): Promise<LoginResponse> {
    const payload = {
      email: user.email,
      sub: user.id,
    };
    return {
      access_token: this.jwtService.sign(payload),
      token_type: TOKEN_TYPE,
      expires_in: ms(TOKEN_EXPIRES_IN_SECONDS),
    };
  }
}
