import { Injectable } from '@nestjs/common';
import { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET } from '../config';
import RsaSigner from '../infrastructure/rsaSigner';
import { SupportedAlgorithms } from '../domain/supportedAlgorithms';
import { SignatureOptions } from '../domain/signatureOptions';
import { Payload } from '../domain/payload';

export interface SignatureRequest {
  role: number;
  meetingNumber?: number;
  topic?: string;
  expirationSeconds?: number;
}

export interface SignatureResponse {
  signature: string;
}

@Injectable()
export class SignatureService {
  constructor(private rsaSigner: RsaSigner) {}

  signature(request: SignatureRequest): SignatureResponse {
    const iat = Math.floor(Date.now() / 1000);
    const exp = request.expirationSeconds
      ? iat + request.expirationSeconds
      : iat + 60 * 60 * 2;
    const header = { alg: SupportedAlgorithms.HS256, typ: 'JWT' };
    let payload = {
      appKey: ZOOM_MEETING_SDK_KEY,
      sdkKey: ZOOM_MEETING_SDK_KEY,
      role: request.role,
      iat,
      exp,
      tokenExp: exp,
    } as Payload;
    if (request.meetingNumber) {
      payload = { ...payload, mn: request.meetingNumber };
    }
    if (request.topic) {
      payload = { ...payload, tpc: request.topic };
    }
    const signatureOptions: SignatureOptions = {
      alg: SupportedAlgorithms.HS256,
      header: header,
      payload: payload,
      secret: ZOOM_MEETING_SDK_SECRET,
    };
    const sdkJWT = this.rsaSigner.sign(signatureOptions);
    return { signature: sdkJWT };
  }
}
