import {
  exportJWK,
  generateKeyPair,
  importJWK,
  JWK,
  jwtVerify,
  SignJWT,
} from 'jose';

export interface JWTValidationResult {
  valid: boolean;
  decodedPayload?: JwtPayload;
  message?: string;
}

export interface JwtPayload {
  [key: string]: any;
}

export class JoseWrapper {
  private readonly privateKey: JWK;
  constructor(privateKey: string) {
    const jsonString = Buffer.from(privateKey, 'base64').toString('utf-8');
    this.privateKey = JSON.parse(jsonString);
  }

  public static async generateKeys(alg: string = 'ES256'): Promise<string> {
    const key = await exportJWK((await generateKeyPair(alg)).privateKey);
    const jsonString = JSON.stringify(key);
    return Buffer.from(jsonString).toString('base64');
  }

  public async verifyJwt(jwt: string): Promise<JWTValidationResult> {
    try {
      const result = await jwtVerify(
        jwt,
        await importJWK(this.privateKey, this.privateKey.alg ?? 'ES256'),
      );
      return { valid: true, decodedPayload: result.payload };
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
  }

  public async signJwt(payload: JwtPayload, issuer: string): Promise<string> {
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: this.privateKey.alg ?? 'ES256' })
      .setIssuedAt()
      .setIssuer(issuer)
      .setExpirationTime('5 minutes')
      .sign(await importJWK(this.privateKey, this.privateKey.alg ?? 'ES256'));
  }
}
