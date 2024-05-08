import * as dotenv from 'dotenv';

dotenv.config();

const AUTHORIZE_SERVICE_PRIVATE_KEY = process.env.AUTHORIZE_SERVICE_PRIVATE_KEY;

const TOKEN_TYPE = 'Bearer';

const TOKEN_EXPIRES_IN_SECONDS = process.env.TOKEN_EXPIRES_IN_SECONDS;

const TOKEN_ISSUER = 'learning-platform-backend';

export {
  AUTHORIZE_SERVICE_PRIVATE_KEY,
  TOKEN_TYPE,
  TOKEN_EXPIRES_IN_SECONDS,
  TOKEN_ISSUER,
};
