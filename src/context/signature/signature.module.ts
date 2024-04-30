import { Module } from '@nestjs/common';
import RsaSigner from '../shared/infrastructure/rsaSigner';
import { SignatureService } from './service/signature.service';

@Module({
  providers: [SignatureService, RsaSigner],
  exports: [SignatureService],
})
export class SignatureModule {}
