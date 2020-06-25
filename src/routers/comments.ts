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
import { markdownToHTML } from "../helpers/markdown";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId)
    }
}

const beforePost = async (comment: Comment, req: Request): Promise<Comment> => {

    comment.htmlComment = await markdownToHTML(comment.comment, req.docSource);
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
    comment.htmlComment = await markdownToHTML(comment.comment, req.docSource);

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
    await addUserToWatchersList(comment.docId, comment.authorUserId);


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
    return router;
};
