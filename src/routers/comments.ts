import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import { ICommentAttributes, ICommentInstance } from "../models/comments";

const generateDocHTML = async (comment: ICommentAttributes): Promise<ICommentAttributes> => {
    return new Promise<ICommentAttributes>((resolve, reject) => {
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
        post: { before: generateDocHTML },
        put: { before: generateDocHTML }
    });
    return router;
};
