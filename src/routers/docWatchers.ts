import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { IDocWatcherAttributes, IDocWatcherInstance, DocWatcherType } from "../models/docWatcher";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId),
        watcherType: DocWatcherType.Watcher //return only watchers!
    }
}

const beforePost = (docWatcher: IDocWatcherAttributes, req: Request): Promise<IDocWatcherAttributes> => {
    docWatcher.userId = req.user!.id;
    docWatcher.docId = parseInt(req.params.docId);
    return Promise.resolve(docWatcher);
}

export default (path: string) => {
    const router = routeCreate<IDocWatcherInstance, IDocWatcherAttributes>(path, db.docWatchers, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                include: [{ model: db.users, attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost },
            put: { disable: true },
            delete: { disable: true },
        }
    });
    return router;
};
