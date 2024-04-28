// CONFIG PROJECT FILE
import * as dotenv from 'dotenv';

// importing .env variables
dotenv.config();

const ZOOM_MEETING_SDK_KEY = process.env.ZOOM_MEETING_SDK_KEY;
const ZOOM_MEETING_SDK_SECRET = process.env.ZOOM_MEETING_SDK_SECRET;

export { ZOOM_MEETING_SDK_KEY, ZOOM_MEETING_SDK_SECRET };
