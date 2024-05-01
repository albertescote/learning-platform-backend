import { BadRequestException } from '../../../app/api/exceptions/badRequestException';

export class InvalidRoleException extends BadRequestException {
  constructor(role: string) {
    super(`Invalid role: ${role}`);
  }
}
