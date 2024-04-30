import { Injectable } from '@nestjs/common';
import { ModuleConnectors } from '../../shared/infrastructure/moduleConnectors';
import { PasswordService } from '../../shared/utils/password.service';
import RsaSigner from '../../shared/infrastructure/rsaSigner';
import { SignatureOptions } from '../../signature/domain/signatureOptions';
import { SupportedAlgorithms } from '../../signature/domain/supportedAlgorithms';
import { AUTHORIZE_SERVICE_SECRET } from '../../config';

@Injectable()
export class AccountService {
  constructor(
    private moduleConnectors: ModuleConnectors,
    private passwordService: PasswordService,
    private rsaSigner: RsaSigner,
  ) {}

  async authorize(email: string, password: string) {
    const user = await this.moduleConnectors.obtainUserInformation(email);
    if (!user) {
      throw new Error('user not found');
    }
    const authorized = this.passwordService.comparePasswords(
      password,
      user.toPrimitives().password,
    );
    if (!authorized) {
      throw new Error('invalid password');
    }
    return this.generateAccessToken(user.toPrimitives().id);
  }

  private generateAccessToken(userId: string) {
    const header = { alg: SupportedAlgorithms.HS256, typ: 'JWT' };
    const signatureOptions: SignatureOptions = {
      alg: SupportedAlgorithms.HS256,
      header: header,
      payload: {
        user_id: userId,
      },
      secret: AUTHORIZE_SERVICE_SECRET,
    };
    return this.rsaSigner.sign(signatureOptions);
  }
}
