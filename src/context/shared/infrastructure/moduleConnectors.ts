import { QueryBus } from '@nestjs/cqrs';
import { Injectable } from '@nestjs/common';
import { UserQuery } from '../../user/service/user.query';
import User from '../domain/user';

@Injectable()
class ModuleConnectors {
  constructor(private queryBus: QueryBus) {}
  async obtainUserInformation(email: string): Promise<User> {
    const userQuery = new UserQuery(email);
    return await this.queryBus.execute(userQuery);
  }
}

export { ModuleConnectors };
