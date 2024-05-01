import { NotFoundException } from '../../../app/api/exceptions/notFoundException';

export class MeetingNotFoundException extends NotFoundException {
  constructor(id: string) {
    super(`Meeting not found for this id: ${id}`);
  }
}
