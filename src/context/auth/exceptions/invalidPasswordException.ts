import { UnauthorizedException } from '../../../app/api/exceptions/unauthorizedException';

export class InvalidPasswordException extends UnauthorizedException {
  constructor() {
    super(`Invalid password`);
  }
}
