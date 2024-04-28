import { KJUR } from 'jsrsasign';
import { Injectable } from '@nestjs/common';
import { SignatureOptions } from '../domain/signatureOptions';

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
