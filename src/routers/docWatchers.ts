import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import DocWatcher, { DocWatcherType } from "../models/docWatcher";
import User from "../models/users";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docId: parseInt(req.params.docId),
        watcherType: DocWatcherType.Watcher //return only watchers!
    }
}

const beforePost = (docWatcher: DocWatcher, req: Request): Promise<DocWatcher> => {
    docWatcher.userId = req.user!.id;
    docWatcher.docId = parseInt(req.params.docId);
    return Promise.resolve(docWatcher);
}

export default (path: string) => {
    const router = routeCreate(path, DocWatcher, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                include: [{ model: User, as: "user", attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost },
            put: { disable: true },
            delete: { disable: true },
        }
    });
    return router;
};
