import { getwatchersForDoc } from "../docWatchers";
import Comment from "../../models/comments"
import { emitSockerMessage } from "../../sockets";
import Doc from "../../models/docs";

export const getDocRooms = async (organizationId: string, isDocPrivate: boolean, docId: number) => {
    const rooms: string[] = [];
    if (isDocPrivate) {
        const userIds = await getwatchersForDoc(docId);

        userIds.forEach((userId) => {
            rooms.push(`user:${userId}`)
        })
    }
    else {
        rooms.push(`org:${organizationId}`)
    }

    return rooms;
}

export const reportCommentToWS = async (organizationId: string, isDocPrivate: boolean, comment: Comment, event: string = "post", socketId?: string) => {
    const rooms = await getDocRooms(organizationId, isDocPrivate, comment.docId);
    emitSockerMessage(`comment-${event}`, comment, socketId, rooms);
}

export const reportDocToWS = async (organizationId: string, doc: Doc, event: string = "post", socketId?: string) => {
    const rooms = await getDocRooms(organizationId, doc.isPrivate, doc.id);
    emitSockerMessage(`doc-${event}`, doc, socketId, rooms);
}