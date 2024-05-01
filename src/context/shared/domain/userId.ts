import { v4 as uuidv4, validate } from 'uuid';
import { InvalidUserIdFormatException } from '../exceptions/invalidUserIdFormatException';

export default class UserId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new InvalidUserIdFormatException(value);
    }
  }

  static generate(): UserId {
    return new UserId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
