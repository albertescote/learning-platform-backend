export interface Payload {
  appKey: string;
  sdkKey: string;
  role: number;
  iat: number;
  exp: number;
  tokenExp: number;
  mn?: number;
  tpc?: string;
}
