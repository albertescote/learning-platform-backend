import { Injectable } from '@nestjs/common';
import User from '../domain/user';
import UserId from '../domain/userId';
import { UserRepository } from '../infrastructure/userRepository';

export interface UserRequest {
  firstName: string;
  familyName: string;
  email: string;
  password: string;
}

export interface UserResponse {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
}

@Injectable()
export class UserService {
  constructor(private userRepository: UserRepository) {}

  create(request: UserRequest): UserResponse {
    const user = new User(
      UserId.generate(),
      request.firstName,
      request.familyName,
      request.email,
      request.password,
    );
    const storedUser = this.userRepository.addUser(user);
    return storedUser.toPrimitives();
  }

  getById(id: string): UserResponse {
    const storedUser = this.userRepository.getUserById(new UserId(id));
    return storedUser.toPrimitives();
  }

  getAll(): UserResponse[] {
    const users = this.userRepository.getAllUsers();
    return users.map((user) => {
      return user.toPrimitives();
    });
  }

  update(id: string, request: UserRequest): UserResponse {
    const updatedUser = this.userRepository.updateUser(
      new UserId(id),
      User.fromPrimitives({ ...request, id }),
    );
    return updatedUser.toPrimitives();
  }

  deleteById(id: string): void {
    const deleted = this.userRepository.deleteUser(new UserId(id));
    if (!deleted) {
      throw new Error(`unable to delete this user: ${id}`);
    }
    return;
  }
}
