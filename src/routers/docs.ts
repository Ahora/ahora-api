import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "./../models/index";
import marked from "marked";
import { IOrganizationInstance } from "../models/organization";
import { IDocStatusInstance } from "../models/docStatuses";
import { stringify } from "querystring";
import { isArray } from "util";

const beforePost = async (doc: IDocAttributes, req: Request): Promise<IDocAttributes> => {
    const updatedDoc =  await generateDocHTML(doc);
    if(req && req.org) {
        updatedDoc.status = req.org.defaultStatus;
        updatedDoc.organizationId = req.org.id;
    }

    return updatedDoc;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: IOrganizationInstance = req.org!;
    const query: any = { organizationId: currentOrg.id };

    const statuses: IDocStatusInstance[] = await db.docStatuses.findAll({ where: { organizationId: currentOrg.id }});
    const Statusmap: Map<string, IDocStatusInstance> = new Map();
    statuses.forEach(status => {
        Statusmap.set(status.name.toLowerCase(), status);
    });

    if(req.query.status) {
        if(typeof(req.query.status) === "string") {
            req.query.status = [req.query.status];
        }
    }
    
    if(isArray(req.query.status)) {
        const statusIds: number[] = [];
        req.query.status.forEach((statusName: string) => {
            const value: IDocStatusInstance | undefined = Statusmap.get(statusName.toLowerCase());
            if(value) {
                statusIds.push(value.id);
            }
        });
        query.status = statusIds;
    }

    return query;
}


const generateDocHTML = async (doc: IDocAttributes): Promise<IDocAttributes> => {
    return new Promise<IDocAttributes>((resolve, reject) => {
        if(doc.description) {
            marked(doc.description, (error: any, parsedResult: string) => {
                if(error) {
                    reject(error);
                }
                else {
                    doc.htmlDescription = parsedResult;
                    resolve(doc);
                }
            });
        }
        else {
            resolve(doc);
        }
    });
}

export default (path: string) => {

    const router  = routeCreate<IDocInstance, IDocAttributes>(path, db.docs, { 
        get: { getAdditionalParams: generateQuery },
        post: { before: beforePost },
        put: { before: generateDocHTML }
    });
    return router;
};
