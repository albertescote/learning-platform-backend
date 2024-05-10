import { BadRequestException } from '../../../app/api/exceptions/badRequestException';

export class InvalidStudentIdException extends BadRequestException {
  constructor(id: string) {
    super(`Student not found for this id: ${id}`);
  }
}
