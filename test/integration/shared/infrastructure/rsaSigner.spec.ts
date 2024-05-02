import { Test, TestingModule } from '@nestjs/testing';
import { KJUR } from 'jsrsasign';
import RsaSigner from '../../../../src/context/shared/infrastructure/rsaSigner';
import { SignatureOptions } from '../../../../src/context/meeting/domain/signatureOptions';
import { SupportedAlgorithms } from '../../../../src/context/meeting/domain/supportedAlgorithms';

describe('RsaSigner (Integration)', () => {
  let rsaSigner: RsaSigner;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RsaSigner],
    }).compile();

    rsaSigner = module.get<RsaSigner>(RsaSigner);
  });

  it('should sign and verify JWT successfully', () => {
    const signatureOptions: SignatureOptions = {
      alg: SupportedAlgorithms.HS256,
      header: { alg: 'HS256' },
      payload: { data: 'example' },
      secret: 'secret',
    };

    const jwt = rsaSigner.sign(signatureOptions);
    const verified = rsaSigner.verify(jwt, signatureOptions.secret);

    const verifiedDirectly = KJUR.jws.JWS.verify(jwt, signatureOptions.secret);
    expect(verified).toBe(true);
    expect(verifiedDirectly).toBe(true);
  });

  it('should fail to verify invalid JWT', () => {
    const invalidJwt = 'invalid.jwt';

    const verified = rsaSigner.verify(invalidJwt, 'secret');

    expect(verified).toBe(false);
  });
});
