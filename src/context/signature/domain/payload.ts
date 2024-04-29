export interface MeetingPayload {
  appKey: string;
  sdkKey: string;
  role: number;
  iat: number;
  exp: number;
  tokenExp: number;
  mn: number;
}

export interface VideoPayload {
  app_key: string;
  role_type: number;
  tpc: string;
  version: number;
  iat: number;
  exp: number;
}
