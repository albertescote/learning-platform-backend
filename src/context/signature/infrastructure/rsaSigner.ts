import { KJUR } from 'jsrsasign';
import { Injectable } from '@nestjs/common';
import { SupportedAlgorithms } from '../domain/supportedAlgorithms';

export interface SignatureOptions {
  alg: SupportedAlgorithms;
  header: string | { alg: string };
  payload: string | object;
  secret: string;
}

@Injectable()
export default class RsaSigner {
  public sign(signatureOptions: SignatureOptions): string {
    return KJUR.jws.JWS.sign(
      signatureOptions.alg.toString(),
      signatureOptions.header,
      signatureOptions.payload,
      signatureOptions.secret,
    );
  }
}
