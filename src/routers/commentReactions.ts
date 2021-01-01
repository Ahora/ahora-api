import { Request } from "express";
import routeCreate from "./base";
import CommentReaction from "../models/commentReactions";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        commentId: parseInt(req.params.commentId)
    };
}

const beforePost = async (reaction: CommentReaction, req: Request): Promise<CommentReaction> => {
    reaction.userId = req.user!.id;
    reaction.commentId = parseInt(req.params.commentId);
    reaction.reactionId = req.body.reactionId;
    return reaction;
}

export default (path: string) => {

    const router = routeCreate(path, Comment, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                useOnlyAdditionalParams: true
            },
            post: { before: beforePost }
        }
    });


    return router;
};
