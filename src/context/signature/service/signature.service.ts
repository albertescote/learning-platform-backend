import { Injectable } from '@nestjs/common';
import { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET } from '../config';
import RsaSigner from '../../shared/infrastructure/rsaSigner';
import { SupportedAlgorithms } from '../domain/supportedAlgorithms';
import { SignatureOptions } from '../domain/signatureOptions';
import { VideoPayload } from '../domain/payload';

export interface SignatureMeetingRequest {
  role: number;
  meetingNumber: number;
  expirationSeconds?: number;
}

export interface SignatureVideoRequest {
  role: number;
  topic: string;
  expirationSeconds?: number;
}

export interface SignatureResponse {
  signature: string;
}

@Injectable()
export class SignatureService {
  constructor(private rsaSigner: RsaSigner) {}

  signature(request: SignatureVideoRequest): SignatureResponse {
    const iat = Math.floor(Date.now() / 1000);
    const exp = request.expirationSeconds
      ? iat + request.expirationSeconds
      : iat + 60 * 60 * 2;
    const header = { alg: SupportedAlgorithms.HS256, typ: 'JWT' };
    const payload = {
      app_key: ZOOM_MEETING_SDK_KEY,
      role_type: request.role,
      tpc: request.topic,
      version: 1,
      iat,
      exp,
    } as VideoPayload;
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
