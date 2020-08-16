import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import Doc from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import Comment from "../models/comments";
import { addUserToWatchersList } from "../helpers/docWatchers";
import { notifyComment } from "../helpers/notifier";
import User from "../models/users";
import { RestCollectorClient, RestCollectorRequest } from "rest-collector";
import GithubCommentsProvider from "../providers/github/GithubCommentsProvider";
import { markdownToHTML, handleMentions, extractMentionsFromMarkdown } from "../helpers/markdown";
import { updateMentions } from "../helpers/mention";
import { updateLastView } from "../helpers/docs/db";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId)
    }
}

const beforePost = async (comment: Comment, req: Request): Promise<Comment> => {

    if (comment.comment) {
        const result = await handleMentions(comment.comment);
        comment.htmlComment = await markdownToHTML(result.markdown, req.docSource);
    }

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
    if (comment.comment) {
        const result = await handleMentions(comment.comment);
        await updateMentions(result.mentions.map((user) => user.id), parseInt(req.params.docId), parseInt(req.params.id));
        comment.htmlComment = await markdownToHTML(result.markdown, req.docSource);
    }

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

const updateCommentsNumberAndTime = async (docId: number, updateTime: Date): Promise<void> => {
    const count = await Comment.count({
        where: { docId }
    });

    Doc.update({
        commentsNumber: count,
        updatedAt: updateTime
    }, {
        where: { id: docId }
    });
}

const afterPut = async (comment: Comment, req: Request): Promise<Comment> => {
    await updateCommentsNumberAndTime(comment.docId, comment.updatedAt);
    await updateLastView(comment.docId, comment.authorUserId);

    let watchers: number[] = [];

    if (req.user) {
        watchers.push(req.user.id);
    }

    if (comment.comment) {
        const mentionUsers = await extractMentionsFromMarkdown(comment.comment);
        const mentionedUserIds = mentionUsers.map((user) => user.id);

        watchers = [...watchers, ...mentionedUserIds];

        await updateMentions(mentionedUserIds, comment.docId, comment.id);
    }

    for (let index = 0; index < watchers.length; index++) {
        await addUserToWatchersList(comment.docId, watchers[index]);
    }
    return comment;
}

const afterDelete = async (comment: Comment, req: Request): Promise<Comment> => {
    await updateCommentsNumberAndTime(comment.docId, comment.updatedAt);

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

    await updateCommentsNumberAndTime(comment.docId, comment.createdAt);
    await updateLastView(comment.docId, comment.authorUserId);

    let watchers: number[] = [comment.authorUserId];

    if (req.user) {
        watchers.push(req.user.id);
    }
    if (comment.comment) {
        const mentionUsers = await extractMentionsFromMarkdown(comment.comment);
        const mentionedUserIds = mentionUsers.map((user) => user.id);
        await updateMentions(mentionedUserIds, comment.docId, comment.id);

        watchers = [...watchers, ...mentionedUserIds];
    }

    for (let index = 0; index < watchers.length; index++) {
        await addUserToWatchersList(comment.docId, watchers[index]);
    }


    const currentDoc: Doc | null = await Doc.findOne({ where: { id: comment.docId } });
    if (currentDoc && req.user) {
        await notifyComment(req.user, currentDoc, comment, req.org!);
    }

    return returnValue;
}

export default (path: string) => {

    const router = routeCreate(path, Comment, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                order: [["updatedAt", "DESC"]],
                include: [{ model: User, as: "author", attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost, after: afterPost },
            put: { before: beforePut, after: afterPut },
            delete: { after: afterDelete }
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
