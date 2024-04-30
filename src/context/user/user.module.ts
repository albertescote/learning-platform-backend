import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/userRepository';

@Module({
  providers: [UserRepository],
  exports: [],
})
export class UserModule {}
