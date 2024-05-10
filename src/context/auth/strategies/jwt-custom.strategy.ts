import { PassportStrategy } from '@nestjs/passport';
import { Injectable } from '@nestjs/common';
import { AuthService } from '../service/auth.service';
import { UserAuthInfo } from '../../shared/domain/userAuthInfo';
import { Request } from 'express';
import { InvalidAuthorizationHeader } from '../exceptions/invalidAuthorizationHeader';
import { Strategy } from 'passport-custom';

@Injectable()
export class JwtCustomStrategy extends PassportStrategy(
  Strategy,
  'jwt-custom',
) {
  constructor(private authService: AuthService) {
    super();
  }

  async validate(req: Request): Promise<UserAuthInfo> {
    const accessToken = this.extractTokenFromHeader(req);
    if (!accessToken) {
      throw new InvalidAuthorizationHeader();
    }
    const accessTokenPayload =
      await this.authService.validateAccessToken(accessToken);
    return {
      email: accessTokenPayload.email,
      id: accessTokenPayload.sub,
      role: accessTokenPayload.role,
    };
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
