
import Comment, { CommentType } from "./../models/comments";
import Doc from "../models/docs";
import OrganizationStatus from "../models/docStatuses";
import User from "../models/users";
import Label from "../models/labels";

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

export const addComment = async (docId: number, user: User, commentMarkDown: string, commentType: CommentType, oldValue: number | null, newValue: number | null): Promise<Comment> => {
    const statusComment: Comment = await Comment.create({
        comment: commentMarkDown,
        authorUserId: user.id,
        docId,
        commentType,
        oldValue,
        newValue
    });

    return statusComment;
}

export const addStatusComment = async (docId: number, from: OrganizationStatus | null, to: OrganizationStatus, user: User): Promise<Comment> => {
    const commentMarkDown: string = `@${user.username} changed status from: **${from ? from.name : "empty"}** to: **${to.name}**`;
    return addComment(docId, user, commentMarkDown, CommentType.statusChanged, from && from.id, to.id);
}

export const addIsPrivateComment = async (docId: number, isPrivate: boolean, user: User): Promise<Comment> => {
    const commentMarkDown: string = `@${user.username} changed doc to **${isPrivate ? "private" : "public"}**`;
    return addComment(docId, user, commentMarkDown, CommentType.isPrivateChanged, !isPrivate ? 1 : 0, isPrivate ? 1 : 0);
}

export const addAssigneeComment = async (docId: number, prevAssigneeUser: User | null, toAssigneeUser: User | null, user: User): Promise<Comment> => {
    const commentMarkDown: string = `@${user.username} assigned doc from: **${prevAssigneeUser ? `@${prevAssigneeUser.username}` : "Unassigned"}** to: **${toAssigneeUser ? `@${toAssigneeUser.username}` : "Unassigned"}**`;
    return addComment(docId, user, commentMarkDown, CommentType.assigneeChanged, prevAssigneeUser && prevAssigneeUser.id, toAssigneeUser && toAssigneeUser.id);
}

export const AddLabelRemovedComment = async (docId: number, labelId: number, user: User): Promise<Comment> => {
    const label = await Label.findOne({ where: { id: labelId } });
    const commentMarkDown: string = `@${user.username} removed label: **${label!.name}**`;
    return addComment(docId, user, commentMarkDown, CommentType.labelRemoved, null, labelId);
}

export const addLabelAddedComment = async (docId: number, labelId: number, user: User): Promise<Comment> => {
    const label = await Label.findOne({ where: { id: labelId } });
    const commentMarkDown: string = `@${user.username} added label: **${label!.name}**`;
    return addComment(docId, user, commentMarkDown, CommentType.labelAdded, null, labelId);
}