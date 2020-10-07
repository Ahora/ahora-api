export const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING as string;
export const GIT_HUB_CALLBACK_URL: string = process.env.GIT_HUB_CALLBACK_URL as string || "http://127.0.0.1:3000/auth/github/callback";
export const MODE: string = process.env.MODE || "development";
export const GIT_HUB_CLIENT_ID: string = process.env.GIT_HUB_CLIENT_ID as string;
export const GIT_HUB_CLIENT_SECRET: string = process.env.GIT_HUB_CLIENT_SECRET as string;
export const SEND_GRID_SECRET: string | undefined = process.env.SEND_GRID_SECRET;
export const COOKIE_SECRET: string = process.env.COOKIE_SECRET as string || "defaultsecret";
export const STORAGE_BUCKET_NAME: string = process.env.STORAGE_BUCKET_NAME as string || "ahorafiles";
export const EMAIL_DOMAIN: string = process.env.EMAIL_DOMAIN as string;
export const URL: string = process.env.URL as string;
export const BLUE_SNAP_SECRET: string = process.env.BLUE_SNAP_SECRET as string;

