import { BadRequestException } from '../../../app/api/exceptions/badRequestException';

export class EmailAlreadyExistsException extends BadRequestException {
  constructor(email: string) {
    super(`A user with this email is already registered: ${email}`);
  }
}
