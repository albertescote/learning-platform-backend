import { Module } from '@nestjs/common';
import RsaSigner from './infrastructure/rsasigner';
import { SignatureService } from './service/signature.service';

@Module({
  providers: [SignatureService, RsaSigner],
  exports: [SignatureService],
})
export class SignatureModule {}
