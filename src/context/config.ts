import * as dotenv from 'dotenv';

dotenv.config();

const AUTHORIZE_SERVICE_SECRET = process.env.AUTHORIZE_SERVICE_SECRET;

export { AUTHORIZE_SERVICE_SECRET };
