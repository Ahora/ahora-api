import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import { ICommentAttributes, ICommentInstance } from "../models/comments";
import { addUserToWatchersList } from "../helpers/docWatchers";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId)
    }
}

const generateDocHTML = async (comment: ICommentAttributes, req: Request): Promise<ICommentAttributes> => {
    comment.authorUserId = req.user!.id;
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

const afterPost = async (comment: ICommentInstance, req: Request): Promise<ICommentInstance> => {
    const returnValue: any = {
        authorUserId: comment.authorUserId,
        id: comment.id,
        comment: comment.comment,
        htmlComment: comment.htmlComment,
        pinned: comment.pinned,
        docId: comment.docId
    };

    returnValue.user = {
        displayName: req.user!.displayName,
        username: req.user!.username
    };

    await addUserToWatchersList(comment.docId, comment.authorUserId);

    return returnValue;
}

export default (path: string) => {

    const router = routeCreate<ICommentInstance, ICommentAttributes>(path, db.comment, {
        get: {
            getAdditionalParams: generateQuery,
            include: [{ model: db.users, attributes: ["displayName", "username"] }]
        },
        post: { before: generateDocHTML, after: afterPost },
        put: { before: generateDocHTML }
    });
    return router;
};
