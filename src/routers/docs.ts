import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "./../models/index";
import marked from "marked";

const beforePost = async (doc: IDocAttributes, req: Request): Promise<IDocAttributes> => {
    const updatedDoc =  await generateDocHTML(doc);
    if(req && req.org) {
        console.log("fsdfsdfdsfds");
        updatedDoc.status = req.org.defaultStatus;
    }

    return updatedDoc;
};


const generateDocHTML = async (doc: IDocAttributes): Promise<IDocAttributes> => {
    return new Promise<IDocAttributes>((resolve, reject) => {
        marked(doc.description, (error: any, parsedResult: string) => {
        if(error) {
            reject(error);
        }
        else {
            doc.htmlDescription = parsedResult;
            resolve(doc);
        }
        });
    });
}

export default (path: string) => {

    const router  = routeCreate<IDocInstance, IDocAttributes>(path, db.docs, { 
        post: { before: beforePost },
        put: { before: generateDocHTML }
    });
    return router;
};
