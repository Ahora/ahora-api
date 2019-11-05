export const DB_CONNECTION_STRING: string = process.env.DB_CONNECTION_STRING as string || "sqlite:/home/ealster/development/ahora.db";
export const MODE: string = process.env.MODE || "development";
export const USERS_API = process.env.USERS_API || "http://usersapi";