import { Server, Socket } from "@ahora/socket.io";
import { createAdapter } from 'socket.io-redis';
import { RedisClient } from 'redis';
import { COOKIE_SECRET, DB_CONNECTION_STRING, WEBSOCKET_CACHE_ADDRESS, WEBSOCKET_CACHE_PASSWORD } from "../config";
import cookieParser from "cookie-parser";
import { authorize } from './auth';
import pgSession from "connect-pg-simple";
import passport from "passport";
import session from "express-session";
import User from "../models/users";

let socketInstance1: Server;
export default (async (http: any) => {
    const io: Server = new Server(http);

    io.use(authorize({
        secret: COOKIE_SECRET,
        store: new (pgSession(session))({
            conString: DB_CONNECTION_STRING
        }),
        passport: passport,
        cookieParser: cookieParser
    }));

    if (WEBSOCKET_CACHE_ADDRESS) {
        const pubClient = new RedisClient({ host: WEBSOCKET_CACHE_ADDRESS, port: 6379, password: WEBSOCKET_CACHE_PASSWORD });
        const subClient = pubClient.duplicate();

        const adapter = createAdapter({ pubClient, subClient });

        io.adapter(adapter);
    }

    io.on("connection", (socket: Socket) => {
        socket.on("joinroom", (organizationName: string) => {
            if (socket.rooms) {
                socket.rooms.forEach((room) => { socket.leave(room) });
            }

            const user: User | undefined = (socket.request as any).user;
            if (user) {
                socket.join(`user:${user.id}`);
            }

            //TODO: Validate organization permission!
            socket.join(`org:${organizationName}`);

        });
    });
    socketInstance1 = io;
});

export const emitSockerMessage = (event: string, data: any, excludeSocketId?: string, rooms?: string[]) => {
    let namespace = socketInstance1.sockets;
    rooms?.forEach((room) => {
        namespace = namespace.to(room);
    });
    namespace.emitNG(event, excludeSocketId, data);
}