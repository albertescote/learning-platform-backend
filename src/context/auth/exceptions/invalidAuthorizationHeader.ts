import { UnauthorizedException } from '../../../app/api/exceptions/unauthorizedException';

export class InvalidAuthorizationHeader extends UnauthorizedException {
  constructor() {
    super(`Missing or invalid authorization header`);
  }
}
