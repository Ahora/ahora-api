export const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING as string || "sqlite:/home/ealster/development/ahora.db";
export const MODE: string = process.env.MODE || "development";
export const GIT_HUB_CLIENT_ID: string = process.env.GIT_HUB_CLIENT_ID as string;
export const GIT_HUB_CLIENT_SECRET: string = process.env.GIT_HUB_CLIENT_SECRET as string;
export const COOKIE_SECRET: string = process.env.COOKIE_SECRET as string || "defaultsecret";
