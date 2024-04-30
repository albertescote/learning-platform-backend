import UserId from './userId';

export interface UserPrimitives {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  password: string;
}

export default class User {
  constructor(
    private id: UserId,
    private firstName: string,
    private familyName: string,
    private email: string,
    private password: string,
  ) {}

  static fromPrimitives(user: UserPrimitives): User {
    return new User(
      new UserId(user.id),
      user.firstName,
      user.familyName,
      user.email,
      user.password,
    );
  }

  toPrimitives(): UserPrimitives {
    return {
      id: this.id.toPrimitive(),
      firstName: this.firstName,
      familyName: this.familyName,
      email: this.email,
      password: this.password,
    };
  }
}
