import { SupportedAlgorithms } from './supportedAlgorithms';

export interface SignatureOptions {
  alg: SupportedAlgorithms;
  header: string | { alg: string };
  payload: string | object;
  secret: string;
}
