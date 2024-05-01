import UserId from '../../shared/domain/userId';
import { Role } from '../../shared/domain/role';
import { InvalidRoleException } from '../../shared/exceptions/invalidRoleException';

export interface UserInfoDtoPrimitives {
  id: string;
  firstName: string;
  familyName: string;
  email: string;
  role: string;
}

export default class UserInfoDto {
  constructor(
    private id: UserId,
    private firstName: string,
    private familyName: string,
    private email: string,
    private role: Role,
  ) {}

  static fromPrimitives(user: UserInfoDtoPrimitives): UserInfoDto {
    const role = Role[user.role];
    if (!role) {
      throw new InvalidRoleException(user.role);
    }
    return new UserInfoDto(
      new UserId(user.id),
      user.firstName,
      user.familyName,
      user.email,
      role,
    );
  }

  toPrimitives(): UserInfoDtoPrimitives {
    return {
      id: this.id.toPrimitive(),
      firstName: this.firstName,
      familyName: this.familyName,
      email: this.email,
      role: this.role.toString(),
    };
  }
}
