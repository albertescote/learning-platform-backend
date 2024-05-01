import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UserInfoDtoPrimitives } from '../domain/userInfoDto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({ usernameField: 'email' });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<UserInfoDtoPrimitives> {
    const userInfo = await this.authService.validateUser(email, password);
    return userInfo.toPrimitives();
  }
}
