import { BadRequestException } from '../../../app/api/exceptions/badRequestException';

export class InvalidRoleForRequestedStudentException extends BadRequestException {
  constructor(id: string) {
    super(`The requested student doesn't has the role of student: ${id}`);
  }
}
