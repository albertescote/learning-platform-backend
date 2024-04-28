import {
  SignatureRequest,
  SignatureService,
} from '../../../../src/context/signature/service/signature.service';
import RsaSigner from '../../../../src/context/signature/infrastructure/rsaSigner';
import { mock } from 'jest-mock-extended';
import { SupportedAlgorithms } from '../../../../src/context/signature/domain/supportedAlgorithms';
import {
  ZOOM_MEETING_SDK_KEY,
  ZOOM_MEETING_SDK_SECRET,
} from '../../../../src/context/signature/config';
import { SignatureOptions } from '../../../../src/context/signature/domain/signatureOptions';

describe('Signature Service should', () => {
  it('create a signature for a valid input', () => {
    const rsaSignerMock = mock<RsaSigner>();
    const signatureService = new SignatureService(rsaSignerMock);
    const signatureRequest: SignatureRequest = {
      role: 0,
      expirationSeconds: 2000,
      meetingNumber: 123456,
    };
    const expectedSignedJwt = 'signed-jwt';
    rsaSignerMock.sign.mockReturnValue(expectedSignedJwt);

    const signatureResponse = signatureService.signature(signatureRequest);

    expect(signatureResponse.signature).toStrictEqual(expectedSignedJwt);
    const iat = Math.floor(Date.now() / 1000);
    const exp = signatureRequest.expirationSeconds
      ? iat + signatureRequest.expirationSeconds
      : iat + 60 * 60 * 2;
    const expectedPayload = {
      appKey: ZOOM_MEETING_SDK_KEY,
      sdkKey: ZOOM_MEETING_SDK_KEY,
      mn: signatureRequest.meetingNumber,
      role: signatureRequest.role,
      iat,
      exp,
      tokenExp: exp,
    };
    expect(rsaSignerMock.sign).toHaveBeenCalledWith({
      alg: SupportedAlgorithms.HS256,
      header: { alg: SupportedAlgorithms.HS256, typ: 'JWT' },
      payload: expectedPayload,
      secret: ZOOM_MEETING_SDK_SECRET,
    } as SignatureOptions);
  });
});
