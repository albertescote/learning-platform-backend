import { v4 as uuidv4, validate } from 'uuid';

export default class UserId {
  constructor(private value: string) {
    if (!validate(value)) {
      throw new Error('invalid userId format');
    }
  }

  static generate(): UserId {
    return new UserId(uuidv4());
  }

  toPrimitive(): string {
    return this.value;
  }
}
