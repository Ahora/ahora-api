import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import User from "../models/users";
import OrganizationShortcut from "../models/OrganizationShortcut";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        userId: req.user!.id,
        organizationId: req.org!.id
    }
}

const beforePost = (notification: OrganizationShortcut, req: Request): Promise<OrganizationShortcut> => {
    notification.userId = req.user!.id;
    notification.organizationId = req.org!.id;
    return Promise.resolve(notification);
}

export default (path: string) => {
    const router = routeCreate(path, OrganizationShortcut, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery
            },
            post: { before: beforePost }
        }
    });
    return router;
};
