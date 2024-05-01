import { UnauthorizedException } from '../../../app/api/exceptions/unauthorizedException';

export class InvalidEmailException extends UnauthorizedException {
  constructor(email: string) {
    super(`Invalid email: ${email}`);
  }
}
