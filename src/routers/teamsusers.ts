import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import OrganizationTeamUser from "../models/organizationTeamsUsers";
import User from "../models/users";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        teamId: (req.params.teamId === "null") ? null : parseInt(req.params.teamId),
        organizationId: req.org!.id
    }
}

const beforePost = async (user: OrganizationTeamUser, req: Request): Promise<OrganizationTeamUser> => {
    user.teamId = (req.params.teamId === "null") ? null : parseInt(req.params.teamId);
    user.organizationId = req.org!.id;
    return Promise.resolve(user);
}

const afterPost = async (team: OrganizationTeamUser, req: Request): Promise<OrganizationTeamUser> => {
    const returnValue: any = {
        userId: team.userId,
        id: team.id,
        organizationId: req.org!.id,
        permissionType: team.permissionType,
        teamId: team.teamId
    };

    const user: User | null = await User.findOne({ where: { id: team.userId } });
    if (user) {
        returnValue.User = {
            displayName: user.displayName,
            username: user.username
        };

    }

    return returnValue;
}

export default (path: string) => {

    const router = routeCreate(path, OrganizationTeamUser, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                include: [{ model: User, attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost, after: afterPost },
            put: { before: beforePost }
        }
    });
    return router;
};
