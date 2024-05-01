import { KJUR } from 'jsrsasign';
import { Injectable } from '@nestjs/common';
import { SignatureOptions } from '../../meeting/domain/signatureOptions';

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

  public verify(jwt: string, secret: string): boolean {
    return KJUR.jws.JWS.verify(jwt, secret);
  }
}
