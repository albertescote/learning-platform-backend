import { Inject, Injectable } from '@nestjs/common';
import { ModuleConnectors } from '../../shared/infrastructure/moduleConnectors';
import { PasswordService } from '../../shared/utils/password.service';
import UserInfoDto from '../domain/userInfoDto';
import { TOKEN_EXPIRES_IN_SECONDS, TOKEN_ISSUER, TOKEN_TYPE } from '../config';
import ms from 'ms';
import { InvalidEmailException } from '../exceptions/invalidEmailException';
import { InvalidPasswordException } from '../exceptions/invalidPasswordException';
import { AccessTokenPayload } from '../domain/accessTokenPayload';
import { JoseWrapper } from '../../shared/infrastructure/joseWrapper';
import { InvalidAccessToken } from '../exceptions/invalidAccessToken';

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
    @Inject('JoseWrapperInitialized')
    private joseWrapper: JoseWrapper,
  ) {}

  async validateUser(email: string, password: string): Promise<UserInfoDto> {
    const user = await this.moduleConnectors.obtainUserInformation(
      undefined,
      email,
    );
    if (!user) {
      throw new InvalidEmailException(email);
    }
    const valid = await this.passwordService.comparePasswords(
      password,
      user.toPrimitives().password,
    );
    if (!valid) {
      throw new InvalidPasswordException();
    }
    return UserInfoDto.fromPrimitives(user.toPrimitives());
  }

  async login(user: LoginRequest): Promise<LoginResponse> {
    const payload: AccessTokenPayload = {
      email: user.email,
      sub: user.id,
      role: user.role,
    };
    const jwt = await this.joseWrapper.signJwt(payload, TOKEN_ISSUER);
    return {
      access_token: jwt,
      token_type: TOKEN_TYPE,
      expires_in: ms(TOKEN_EXPIRES_IN_SECONDS),
    };
  }

  async validateAccessToken(accessToken: string): Promise<AccessTokenPayload> {
    const validationResult = await this.joseWrapper.verifyJwt(accessToken);
    if (!validationResult.valid) {
      throw new InvalidAccessToken();
    }
    const accessTokenPayload =
      validationResult.decodedPayload as AccessTokenPayload;
    const user = await this.moduleConnectors.obtainUserInformation(
      accessTokenPayload.sub,
    );
    if (!user) {
      throw new InvalidEmailException(accessTokenPayload.email);
    }
    return {
      email: accessTokenPayload.email,
      sub: accessTokenPayload.sub,
      role: accessTokenPayload.role,
    };
  }
}
