
import Comment from "./../models/comments";
import Doc from "../models/docs";
import OrganizationStatus from "../models/docStatuses";
import User from "../models/users";

export const updateCommentsNumberAndTime = async (docId: number, updateTime?: Date): Promise<void> => {
    const count = await Comment.count({
        where: { docId }
    });

    const updateDocParams: any = { commentsNumber: count };
    if (updateTime) {
        updateDocParams.updatedAt = updateTime;
    }

    Doc.update(updateDocParams, {
        where: { id: docId }
    });
}

export const addComment = async (docId: number, user: User, commentMarkDown: string): Promise<Comment> => {
    const statusComment: Comment = await Comment.create({
        comment: commentMarkDown,
        authorUserId: user.id,
        docId
    });

    return statusComment;
}

export const addStatusComment = async (docId: number, from: OrganizationStatus | null, to: OrganizationStatus, user: User): Promise<Comment> => {
    const commentMarkDown: string = `@${user.username} changed status from: **${from ? from.name : "empty"}** to: **${to.name}**`;
    return addComment(docId, user, commentMarkDown);
}

export const addIsPrivateComment = async (docId: number, isPrivate: boolean, user: User): Promise<Comment> => {
    const commentMarkDown: string = `@${user.username} changed doc to **${isPrivate ? "private" : "public"}**`;
    return addComment(docId, user, commentMarkDown);
}

export const addAssigneeComment = async (docId: number, prevAssigneeUser: User | null, toAssigneeUser: User, user: User): Promise<Comment> => {
    const commentMarkDown: string = `@${user.username} assigned doc from: **${prevAssigneeUser ? `@${prevAssigneeUser.username}` : "Unassigned"}** to: **@${toAssigneeUser.username}**`;
    return addComment(docId, user, commentMarkDown);
}