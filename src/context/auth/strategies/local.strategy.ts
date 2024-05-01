import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    try {
      const userInfo = await this.authService.validateUser(email, password);
      return userInfo.toPrimitives();
    } catch (e) {
      throw new UnauthorizedException(e.message);
    }
  }
}
