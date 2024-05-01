import { BadRequestException } from '../../../app/api/exceptions/badRequestException';

export class InvalidUserIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid user id format: ${id}. It must be a UUID`);
  }
}
