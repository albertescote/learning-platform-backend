import * as dotenv from 'dotenv';

dotenv.config();

const AUTHORIZE_SERVICE_SECRET = process.env.AUTHORIZE_SERVICE_SECRET;

const TOKEN_TYPE = 'bearer';

const TOKEN_EXPIRES_IN_SECONDS = process.env.TOKEN_EXPIRES_IN_SECONDS;

export { AUTHORIZE_SERVICE_SECRET, TOKEN_TYPE, TOKEN_EXPIRES_IN_SECONDS };
