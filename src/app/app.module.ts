import { Module } from '@nestjs/common';
import { SignatureController } from './api/signature.controller';
import { SignatureModule } from '../context/signature/signature.module';

@Module({
  imports: [SignatureModule],
  controllers: [SignatureController],
})
export class AppModule {}
