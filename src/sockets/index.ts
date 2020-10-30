import socketinfra from "socket.io";


let socketInstance1: socketinfra.Socket;
export default (async (http: any) => {
    return new Promise((resolve) => {
        var io = socketinfra(http);
        io.on('connection', (socket) => {
            socketInstance1 = socket;
            resolve(socket);
        });
    });
})

export const emitSockerMessage = (event: string, data: any, room?: string) => {
    let sockerInstance: socketinfra.Socket = socketInstance1;
    if (room) {
        sockerInstance = sockerInstance.to(room);
    }

    sockerInstance.broadcast.emit(event, data);
}