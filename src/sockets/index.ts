import { Server } from "@ahora/socket.io";
import { createAdapter } from 'socket.io-redis';
import { RedisClient } from 'redis';
import { WEBSOCKET_CACHE_ADDRESS, WEBSOCKET_CACHE_PASSWORD } from "../config";

let socketInstance1: any;
export default (async (http: any) => {
    const io = new Server(http, {

    });
    if (WEBSOCKET_CACHE_ADDRESS) {
        const pubClient = new RedisClient({ host: WEBSOCKET_CACHE_ADDRESS, port: 6379, password: WEBSOCKET_CACHE_PASSWORD });
        const subClient = pubClient.duplicate();

        const adapter = createAdapter({ pubClient, subClient });
        io.adapter(adapter);
    }

    socketInstance1 = io;
});

export const emitSockerMessage = (event: string, data: any, excludeSocketId?: string) => {
    socketInstance1.sockets.emitNG(event, excludeSocketId, data);
}