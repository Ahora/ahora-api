import { Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import Comment from "../models/comments";
import GithubCommentsProvider from "../providers/github/GithubCommentsProvider";
import { Op } from "sequelize";
import { reportCommentToWS } from "../helpers/websockets/webSocketHelper";

const generateQuery = async (req: Request): Promise<any> => {
    const query: any = {
        docId: parseInt(req.params.docId)
    }

    if (req.query.pinned) {
        query.pinned = (req.query.pinned === "true");

    }

    if (req.query.createdAt) {
        query.createdAt = { [Op.lt]: req.query.createdAt };
    }
    else if (req.query.fromCreatedAt) {
        query.createdAt = { [Op.gt]: req.query.fromCreatedAt };
    } return query;
}

const beforePost = async (comment: Comment, req: Request): Promise<Comment> => {
    comment.authorUserId = req.user!.id;

    //update comment on Github! so cool
    if (req.docSource && req.doc && req.user) {
        const sourceId = await githubCommentsProvider.addComment({
            comment: comment,
            doc: req.doc,
            docSource: req.docSource,
            user: req.user
        });

        comment.docSourceId = req.docSource.id;
        comment.sourceId = sourceId;

    }
    comment.docId = parseInt(req.params.docId);
    return comment;
}

const beforePut = async (comment: Comment, req: Request): Promise<Comment> => {
    //update comment on Github! so cool
    if (req.docSource && req.doc && req.user) {
        await githubCommentsProvider.putComment({
            comment: comment,
            doc: req.doc,
            docSource: req.docSource,
            user: req.user
        });
    }

    return comment;
}

const githubCommentsProvider = new GithubCommentsProvider();

const afterDelete = async (comment: Comment, req: Request): Promise<Comment> => {
    //update comment on Github! so cool
    if (req.docSource && req.doc && req.user) {
        await githubCommentsProvider.deleteComment({
            comment: comment,
            doc: req.doc,
            docSource: req.docSource,
            user: req.user
        })
    }
    return comment;
}

export default (path: string) => {

    const router = routeCreate(path, Comment, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                useOnlyAdditionalParams: true,
                order: [["createdAt", "DESC"]]
            },
            post: { before: beforePost, webhook: (comment: Comment, req, socketId) => { reportCommentToWS(req.org!.login, req.doc!.isPrivate, comment, "post", socketId) } },
            put: { before: beforePut, webhook: (comment: Comment, req, socketId) => { reportCommentToWS(req.org!.login, req.doc!.isPrivate, comment, "put", socketId) } },
            delete: { after: afterDelete, webhook: (comment: Comment, req, socketId) => { reportCommentToWS(req.org!.login, req.doc!.isPrivate, comment, "delete", socketId) } }
        }
    });

    router.post("/docs/:docId/comments/:id/pin", async (req: Request, res: Response, next: NextFunction) => {
        try {
            await Comment.update({
                pinned: true
            }, { where: { id: req.params.id } });
            res.send();

        } catch (error) {
            next(error);
        }
    });

    router.post("/docs/:docId/comments/:id/unpin", async (req: Request, res: Response, next: NextFunction) => {
        try {
            await Comment.update({
                pinned: false
            }, { where: { id: req.params.id } });
            res.send();
        } catch (error) {
            next(error);
        }
    });
    return router;
};
