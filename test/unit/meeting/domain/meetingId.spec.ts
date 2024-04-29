import MeetingId from '../../../../src/context/meeting/domain/meetingId';

describe('MeetingId should', () => {
  it('generate a random 10 digit value', () => {
    const meetingId = MeetingId.generate();

    expect(meetingId.toPrimitive().toString().length).toStrictEqual(10);
  });

  it('throw an error for an invalid input', () => {
    expect(() => new MeetingId(123)).toThrow();
  });
});
