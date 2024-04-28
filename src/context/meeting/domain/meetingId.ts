export default class MeetingId {
  constructor(private value: number) {
    if (!this.validate(value)) {
      throw new Error('invalid meetingId format');
    }
  }

  static generate(): MeetingId {
    return new MeetingId(
      Math.floor(Math.random() * (1000000000 - 9999999999 + 1)) + 9999999999,
    );
  }

  validate(id: number) {
    return id >= 9999999999 && id <= 1000000000;
  }

  toPrimitive(): number {
    return this.value;
  }
}
