import { Module } from '@nestjs/common';
import { PasswordService } from '../shared/utils/password.service';
import RsaSigner from '../shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../shared/infrastructure/moduleConnectors';
import { AuthService } from './service/auth.service';
import { LocalStrategy } from './strategies/local.strategy';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { AUTHORIZE_SERVICE_SECRET, TOKEN_EXPIRES_IN_SECONDS } from './config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { CqrsModule } from '@nestjs/cqrs';

@Module({
  imports: [
    CqrsModule,
    PassportModule,
    JwtModule.register({
      secret: AUTHORIZE_SERVICE_SECRET,
      signOptions: { expiresIn: TOKEN_EXPIRES_IN_SECONDS },
    }),
  ],
  providers: [
    AuthService,
    ModuleConnectors,
    PasswordService,
    RsaSigner,
    LocalStrategy,
    JwtStrategy,
  ],
  exports: [AuthService],
})
export class AuthModule {}
