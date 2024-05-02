import { validate } from 'uuid';
import UserId from '../../../../src/context/shared/domain/userId';

describe('UserId should', () => {
  it('generate a random 10 digit value', () => {
    const userId = UserId.generate();
    const valid = validate(userId.toPrimitive());

    expect(valid).toBeTruthy();
  });

  it('throw an error for an invalid input', () => {
    expect(() => new UserId('uuid')).toThrow();
  });
});
