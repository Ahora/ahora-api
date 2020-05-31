import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import User from "../models/users";
import OrganizationNotification from "../models/OrganizationNotifications";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        userId: req.user!.id
    }
}

const beforePost = (notification: OrganizationNotification, req: Request): Promise<OrganizationNotification> => {
    notification.userId = req.user!.id;
    notification.organizationId = req.org!.id;
    return Promise.resolve(notification);
}

export default (path: string) => {
    const router = routeCreate(path, OrganizationNotification, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                include: [{ model: User, as: "owner", attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost }
        }
    });
    return router;
};
