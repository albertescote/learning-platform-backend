import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AUTHORIZE_SERVICE_SECRET } from '../config';
import { UserAuthInfo } from '../../shared/domain/userAuthInfo';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: AUTHORIZE_SERVICE_SECRET,
    });
  }

  async validate(payload: any): Promise<UserAuthInfo> {
    return { id: payload.id, email: payload.email };
  }
}
