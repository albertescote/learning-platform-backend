import {
  SignatureService,
  SignatureVideoRequest,
} from '../../../../src/context/meeting/service/signature.service';
import RsaSigner from '../../../../src/context/shared/infrastructure/rsaSigner';
import { mock } from 'jest-mock-extended';
import { SupportedAlgorithms } from '../../../../src/context/meeting/domain/supportedAlgorithms';
import {
  ZOOM_MEETING_SDK_KEY,
  ZOOM_MEETING_SDK_SECRET,
} from '../../../../src/context/meeting/config';
import { SignatureOptions } from '../../../../src/context/meeting/domain/signatureOptions';
import { VideoPayload } from '../../../../src/context/meeting/domain/payload';
import { Role } from '../../../../src/context/shared/domain/role';

describe('Signature Service should', () => {
  it('create a signature for a valid input', () => {
    const rsaSignerMock = mock<RsaSigner>();
    const signatureService = new SignatureService(rsaSignerMock);
    const signatureRequest: SignatureVideoRequest = {
      expirationSeconds: 2000,
      topic: 'topic',
    };
    const expectedSignedJwt = 'signed-jwt';
    rsaSignerMock.sign.mockReturnValue(expectedSignedJwt);

    const signatureResponse = signatureService.signature(
      signatureRequest,
      Role.Student.toString(),
    );

    expect(signatureResponse.signature).toStrictEqual(expectedSignedJwt);
    const iat = Math.floor(Date.now() / 1000);
    const exp = signatureRequest.expirationSeconds
      ? iat + signatureRequest.expirationSeconds
      : iat + 60 * 60 * 2;
    const expectedPayload = {
      app_key: ZOOM_MEETING_SDK_KEY,
      role_type: 0,
      tpc: signatureRequest.topic,
      version: 1,
      iat,
      exp,
    } as VideoPayload;
    expect(rsaSignerMock.sign).toHaveBeenCalledWith({
      alg: SupportedAlgorithms.HS256,
      header: { alg: SupportedAlgorithms.HS256, typ: 'JWT' },
      payload: expectedPayload,
      secret: ZOOM_MEETING_SDK_SECRET,
    } as SignatureOptions);
  });
});
