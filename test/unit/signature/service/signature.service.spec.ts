import {
  SignatureMeetingRequest,
  SignatureService,
  SignatureVideoRequest,
} from '../../../../src/context/signature/service/signature.service';
import RsaSigner from '../../../../src/context/signature/infrastructure/rsaSigner';
import { mock } from 'jest-mock-extended';
import { SupportedAlgorithms } from '../../../../src/context/signature/domain/supportedAlgorithms';
import {
  ZOOM_MEETING_SDK_KEY,
  ZOOM_MEETING_SDK_SECRET,
} from '../../../../src/context/signature/config';
import { SignatureOptions } from '../../../../src/context/signature/domain/signatureOptions';
import {
  MeetingPayload,
  VideoPayload,
} from '../../../../src/context/signature/domain/payload';

describe('Signature Service should', () => {
  it('create a meeting signature for a valid input', () => {
    const rsaSignerMock = mock<RsaSigner>();
    const signatureService = new SignatureService(rsaSignerMock);
    const signatureRequest: SignatureMeetingRequest = {
      role: 0,
      expirationSeconds: 2000,
      meetingNumber: 123456,
    };
    const expectedSignedJwt = 'signed-jwt';
    rsaSignerMock.sign.mockReturnValue(expectedSignedJwt);

    const signatureResponse =
      signatureService.signatureMeeting(signatureRequest);

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
    } as MeetingPayload;
    expect(rsaSignerMock.sign).toHaveBeenCalledWith({
      alg: SupportedAlgorithms.HS256,
      header: { alg: SupportedAlgorithms.HS256, typ: 'JWT' },
      payload: expectedPayload,
      secret: ZOOM_MEETING_SDK_SECRET,
    } as SignatureOptions);
  });
  it('create a video signature for a valid input', () => {
    const rsaSignerMock = mock<RsaSigner>();
    const signatureService = new SignatureService(rsaSignerMock);
    const signatureRequest: SignatureVideoRequest = {
      role: 0,
      expirationSeconds: 2000,
      topic: 'topic',
    };
    const expectedSignedJwt = 'signed-jwt';
    rsaSignerMock.sign.mockReturnValue(expectedSignedJwt);

    const signatureResponse = signatureService.signatureVideo(signatureRequest);

    expect(signatureResponse.signature).toStrictEqual(expectedSignedJwt);
    const iat = Math.floor(Date.now() / 1000);
    const exp = signatureRequest.expirationSeconds
      ? iat + signatureRequest.expirationSeconds
      : iat + 60 * 60 * 2;
    const expectedPayload = {
      app_key: ZOOM_MEETING_SDK_KEY,
      role_type: signatureRequest.role,
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
