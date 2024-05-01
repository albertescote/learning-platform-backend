import { BadRequestException } from '../../../app/api/exceptions/badRequestException';

export class InvalidMeetingIdFormatException extends BadRequestException {
  constructor(id: string) {
    super(`Invalid meeting id format: ${id}. It must be a UUID`);
  }
}
