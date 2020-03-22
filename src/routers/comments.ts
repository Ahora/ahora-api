import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import { ICommentAttributes, ICommentInstance } from "../models/comments";
import { addUserToWatchersList } from "../helpers/docWatchers";
import { notifyComment } from "../helpers/notifier";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId)
    }
}

const beforePost = async (comment: ICommentAttributes, req: Request): Promise<ICommentAttributes> => {
    comment.createdAt = comment.createdAt || new Date();
    comment.updatedAt = comment.updatedAt || new Date();
    return await generateDocHTML(comment, req);
}

const beforePut = async (comment: ICommentAttributes, req: Request): Promise<ICommentAttributes> => {
    comment.updatedAt = comment.updatedAt || new Date();
    return await generateDocHTML(comment, req);
}

const generateDocHTML = async (comment: ICommentAttributes, req: Request): Promise<ICommentAttributes> => {
    if (req.user) {
        comment.authorUserId = req.user.id;
    }
    comment.docId = parseInt(req.params.docId);
    return new Promise<ICommentAttributes>((resolve, reject) => {
        if (comment.comment) {
            marked(comment.comment, (error: any, parsedResult: string) => {
                if (error) {
                    reject(error);
                }
                else {
                    comment.htmlComment = parsedResult;
                    resolve(comment);
                }
            });
        } else {
            resolve(comment);
        }
    });
}

const updateCommentsNumberAndTime = async (docId: number, updateTime: Date): Promise<void> => {
    const count = await db.comment.count({
        where: { docId }
    });

    db.docs.update({
        commentsNumber: count,
        updatedAt: updateTime
    }, {
        where: { id: docId }
    });
}

const afterPut = async (comment: ICommentInstance, req: Request): Promise<ICommentInstance> => {
    await updateCommentsNumberAndTime(comment.docId, comment.updatedAt);
    return comment;
}

const afterDelete = async (comment: ICommentInstance, req: Request): Promise<ICommentInstance> => {
    await updateCommentsNumberAndTime(comment.docId, comment.updatedAt);
    return comment;
}

const afterPost = async (comment: ICommentInstance, req: Request): Promise<ICommentInstance> => {
    const returnValue: any = {
        authorUserId: comment.authorUserId,
        id: comment.id,
        comment: comment.comment,
        updatedAt: comment.updatedAt,
        createdAt: comment.createdAt,
        htmlComment: comment.htmlComment,
        pinned: comment.pinned,
        docId: comment.docId
    };

    if (req.user) {
        returnValue.user = {
            displayName: req.user.displayName,
            username: req.user.username
        };
    }

    await updateCommentsNumberAndTime(comment.docId, comment.createdAt);
    await addUserToWatchersList(comment.docId, comment.authorUserId);


    const currentDoc: IDocInstance | null = await db.docs.findOne({ where: { id: comment.docId } });
    if (currentDoc && req.user) {
        await notifyComment(req.user, currentDoc, comment, req.org!);
    }

    return returnValue;
}

export default (path: string) => {

    const router = routeCreate<ICommentInstance, ICommentAttributes>(path, db.comment, {
        get: {
            getAdditionalParams: generateQuery,
            include: [{ model: db.users, attributes: ["displayName", "username"] }]
        },
        post: { before: beforePost, after: afterPost },
        put: { before: beforePut, after: afterPut },
        delete: { after: afterDelete }
    });
    return router;
};
