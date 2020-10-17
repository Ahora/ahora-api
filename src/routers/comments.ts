import { Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import Comment from "../models/comments";
import User from "../models/users";
import GithubCommentsProvider from "../providers/github/GithubCommentsProvider";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId)
    }
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

const afterPost = async (comment: Comment, req: Request): Promise<Comment> => {
    const returnValue: any = {
        authorUserId: comment.authorUserId,
        id: comment.id,
        comment: comment.comment,
        updatedAt: comment.updatedAt,
        createdAt: comment.createdAt,
        docSourceId: comment.docSourceId,
        sourceId: comment.sourceId,
        htmlComment: comment.htmlComment,
        pinned: comment.pinned,
        docId: comment.docId
    };

    if (req.user) {
        returnValue.author = {
            displayName: req.user.displayName,
            username: req.user.username
        };
    }

    return returnValue;
}

export default (path: string) => {

    const router = routeCreate(path, Comment, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                order: [["createdAt", "ASC"]],
                include: [{ model: User, as: "author", attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost, after: afterPost },
            put: { before: beforePut },
            delete: { after: afterDelete }
        }
    }, "comment");

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
