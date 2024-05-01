import { Injectable } from '@nestjs/common';
import User from '../../shared/domain/user';
import UserId from '../../shared/domain/userId';
import { UserRepository } from '../infrastructure/userRepository';
import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { UserQuery } from './user.query';
import { PasswordService } from '../../shared/utils/password.service';
import { Role } from '../../shared/domain/role';

export interface CreateUserRequest {
  firstName: string;
  familyName: string;
  email: string;
  password: string;
  role: string;
}

export interface UpdateUserRequest {
  firstName: string;
  familyName: string;
  email: string;
  role: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
}

@Injectable()
@QueryHandler(UserQuery)
export class UserService implements IQueryHandler<UserQuery> {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
  ) {}

  async create(request: CreateUserRequest): Promise<UserResponse> {
    const encryptedPassword = await this.passwordService.hashPassword(
      request.password,
    );
    const role = Role[request.role];
    if (!role) {
      throw new Error('invalid role');
    }
    this.checkExistingEmail(request.email);
    const user = new User(
      UserId.generate(),
      request.firstName,
      request.familyName,
      request.email,
      encryptedPassword,
      role,
    );
    const storedUser = this.userRepository.addUser(user);
    const userPrimitives = storedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
    };
  }

  getById(id: string): UserResponse {
    const storedUser = this.userRepository.getUserById(new UserId(id));
    if (!storedUser) {
      throw new Error('user not found');
    }
    const userPrimitives = storedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
    };
  }

  getAll(): UserResponse[] {
    const users = this.userRepository.getAllUsers();
    return users.map((user) => {
      const userPrimitives = user.toPrimitives();
      return {
        id: userPrimitives.id,
        firstName: userPrimitives.firstName,
        familyName: userPrimitives.familyName,
        email: userPrimitives.email,
        role: userPrimitives.role,
      };
    });
  }

  update(id: string, request: UpdateUserRequest): UserResponse {
    const oldUser = this.userRepository.getUserById(new UserId(id));
    if (!oldUser) {
      throw new Error('user not found');
    }
    if (oldUser.toPrimitives().email !== request.email) {
      this.checkExistingEmail(oldUser.toPrimitives().email);
    }
    const updatedUser = this.userRepository.updateUser(
      new UserId(id),
      User.fromPrimitives({
        ...request,
        id,
        password: oldUser.toPrimitives().password,
      }),
    );
    const userPrimitives = updatedUser.toPrimitives();
    return {
      id: userPrimitives.id,
      firstName: userPrimitives.firstName,
      familyName: userPrimitives.familyName,
      email: userPrimitives.email,
      role: userPrimitives.role,
    };
  }

  deleteById(id: string): void {
    const deleted = this.userRepository.deleteUser(new UserId(id));
    if (!deleted) {
      throw new Error(`unable to delete this user: ${id}`);
    }
    return;
  }

  async execute(query: UserQuery): Promise<User> {
    return this.userRepository.getUserByEmail(query.email);
  }

  private checkExistingEmail(email: string): void {
    const existingUserWithSameEmail = this.userRepository.getUserByEmail(email);
    if (!!existingUserWithSameEmail) {
      throw new Error('a user with this email already exists');
    }
  }
}
