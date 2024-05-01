import { NotFoundException } from '../../../app/api/exceptions/notFoundException';

export class UserNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`User not found for this id: ${id}`);
  }
}
