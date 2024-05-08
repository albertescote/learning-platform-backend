import { UnauthorizedException } from '../../../app/api/exceptions/unauthorizedException';

export class InvalidAccessToken extends UnauthorizedException {
  constructor() {
    super(`Invalid access token`);
  }
}
