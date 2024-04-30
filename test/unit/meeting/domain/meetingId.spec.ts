import MeetingId from '../../../../src/context/meeting/domain/meetingId';
import { validate } from 'uuid';

describe('MeetingId should', () => {
  it('generate a random 10 digit value', () => {
    const meetingId = MeetingId.generate();
    const valid = validate(meetingId.toPrimitive());

    expect(valid).toBeTruthy();
  });

  it('throw an error for an invalid input', () => {
    expect(() => new MeetingId('uuid')).toThrow();
  });
});
