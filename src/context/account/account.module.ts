import { Module } from '@nestjs/common';
import { PasswordService } from '../shared/utils/password.service';
import RsaSigner from '../shared/infrastructure/rsaSigner';
import { ModuleConnectors } from '../shared/infrastructure/moduleConnectors';
import { AccountService } from './service/account.service';

@Module({
  providers: [ModuleConnectors, PasswordService, RsaSigner],
  exports: [AccountService],
})
export class AccountModule {}
