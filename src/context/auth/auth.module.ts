import { Module } from '@nestjs/common';
import { PasswordService } from '../shared/utils/password.service';
import { ModuleConnectors } from '../shared/infrastructure/moduleConnectors';
import { AuthService } from './service/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { CqrsModule } from '@nestjs/cqrs';
import { AUTHORIZE_SERVICE_PRIVATE_KEY } from './config';
import { JoseWrapper } from '../shared/infrastructure/joseWrapper';
import { JwtCustomStrategy } from './strategies/jwt-custom.strategy';

@Module({
  imports: [CqrsModule, PassportModule],
  providers: [
    AuthService,
    ModuleConnectors,
    PasswordService,
    LocalStrategy,
    JwtCustomStrategy,
    {
      provide: 'JoseWrapperInitialized',
      useFactory: () => {
        return new JoseWrapper(AUTHORIZE_SERVICE_PRIVATE_KEY);
      },
    },
  ],
  exports: [AuthService],
})
export class AuthModule {}
