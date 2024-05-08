import {
  JoseWrapper,
  JwtPayload,
} from '../../../../src/context/shared/infrastructure/joseWrapper';

describe('JoseWrapper', () => {
  let joseWrapper: JoseWrapper;
  let privateKey: string;

  beforeAll(async () => {
    privateKey = await JoseWrapper.generateKeys();
  });

  beforeEach(() => {
    joseWrapper = new JoseWrapper(privateKey);
  });

  describe('verifyJwt', () => {
    it('should verify JWT successfully', async () => {
      const payload: JwtPayload = { sub: 'user123' };
      const issuer = 'testIssuer';

      const signedJwt = await joseWrapper.signJwt(payload, issuer);

      const result = await joseWrapper.verifyJwt(signedJwt);

      expect(result.valid).toBe(true);
      expect(result.decodedPayload).toEqual({
        ...payload,
        exp: expect.any(Number) as number,
        iat: expect.any(Number) as number,
        iss: issuer,
      });
      expect(result.message).toBeUndefined();
    });

    it('should handle verification failure', async () => {
      const invalidJwt = 'invalidToken';

      const result = await joseWrapper.verifyJwt(invalidJwt);

      expect(result.valid).toBe(false);
      expect(result.decodedPayload).toBeUndefined();
      expect(result.message).toBeDefined();
    });
  });

  describe('signJwt', () => {
    it('should sign JWT successfully', async () => {
      const payload: JwtPayload = { sub: 'user123' };
      const issuer = 'testIssuer';

      const jwt = await joseWrapper.signJwt(payload, issuer);

      expect(typeof jwt).toBe('string');
      expect(jwt.length).toBeGreaterThan(0);
    });
  });
});
