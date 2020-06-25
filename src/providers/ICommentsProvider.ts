import Comment from "./../models/comments"
import DocSource from "../models/docSource";
import User from "../models/users";
import Doc from "../models/docs";

export interface CommentInput {
    comment: Comment;
    docSource: DocSource;
    user: User
    doc: Doc
}

export interface ICommentProvider {
    addComment: (commentInput: CommentInput) => Promise<number>;
    putComment: (commentInput: CommentInput) => Promise<number>;
    deleteComment: (commentInput: CommentInput) => Promise<void>;
}