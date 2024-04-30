import { Injectable } from '@nestjs/common';
import User, { UserPrimitives } from '../domain/user';
import UserId from '../domain/userId';

@Injectable()
export class UserRepository {
  private users: UserPrimitives[] = [];

  addUser(user: User): User {
    this.users.push(user.toPrimitives());
    return user;
  }

  getUserById(id: UserId): User {
    const user = this.users.find((user) => user.id === id.toPrimitive());
    return User.fromPrimitives(user);
  }

  getAllUsers(): User[] {
    return this.users.map((user) => {
      return User.fromPrimitives(user);
    });
  }

  updateUser(id: UserId, updatedUser: User): User {
    const index = this.users.findIndex((user) => user.id === id.toPrimitive());
    if (index !== -1) {
      this.users[index] = {
        ...this.users[index],
        ...updatedUser.toPrimitives(),
      };
      return User.fromPrimitives(this.users[index]);
    }
    return null;
  }

  deleteUser(id: UserId): boolean {
    const index = this.users.findIndex((user) => user.id === id.toPrimitive());
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }
}
