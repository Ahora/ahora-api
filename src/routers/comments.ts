import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import { ICommentAttributes, ICommentInstance } from "../models/comments";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId)
    }
}

const generateDocHTML = async (comment: ICommentAttributes, req: Request): Promise<ICommentAttributes> => {
    return new Promise<ICommentAttributes>((resolve, reject) => {
        comment.docId = parseInt(req.params.docId);
        marked(comment.comment, (error: any, parsedResult: string) => {
        if(error) {
            reject(error);
        }
        else {
            comment.htmlComment = parsedResult;
            resolve(comment);
        }
        });
    });
}

export default (path: string) => {

    const router  = routeCreate<ICommentInstance, ICommentAttributes>(path, db.comment, {
        get: { getAdditionalParams: generateQuery },
        post: { before: generateDocHTML },
        put: { before: generateDocHTML }
    });
    return router;
};
