import { Module } from '@nestjs/common';
import { UserRepository } from './infrastructure/userRepository';
import { PasswordService } from '../shared/utils/password.service';
import { UserService } from './service/user.service';

@Module({
  providers: [UserService, UserRepository, PasswordService],
  exports: [UserService],
})
export class UserModule {}
