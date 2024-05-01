import { v4 as uuidv4, validate } from 'uuid';
import { InvalidMeetingIdFormatException } from '../exceptions/invalidMeetingIdFormatException';

export default class MeetingId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidMeetingIdFormatException(value);
    }
  }

  static generate(): MeetingId {
    return new MeetingId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
