import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import { IOrganizationTeamUserAttribute } from "../models/organizationTeamsUsers";
import { IUserInstance } from "../models/users";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        teamId: (req.params.teamId === "null") ? "null" : parseInt(req.params.teamId),
        organizationId: req.org!.id
    }
}

const beforePost = async (user: IOrganizationTeamUserAttribute, req: Request): Promise<IOrganizationTeamUserAttribute> => {
    user.teamId = (req.params.teamId === "null") ? null : parseInt(req.params.teamId);
    user.organizationId = req.org!.id;
    return Promise.resolve(user);
}

const afterPost = async (team: IOrganizationTeamUserAttribute, req: Request): Promise<IOrganizationTeamUserAttribute> => {
    const returnValue: any = {
        userId: team.userId,
        id: team.id,
        organizationId: req.org!.id,
        teamId: team.teamId
    };

    const user: IUserInstance | null = await db.users.findOne({ where: { id: team.userId } });
    if (user) {
        returnValue.user = {
            displayName: user.displayName,
            username: user.username
        };

    }

    return returnValue;
}

export default (path: string) => {

    const router = routeCreate<IOrganizationTeamUserAttribute, IOrganizationTeamUserAttribute>(path, db.organizationTeamsUsers, {
        get: {
            getAdditionalParams: generateQuery,
            include: [{ model: db.users, attributes: ["displayName", "username"] }]
        },
        post: { before: beforePost, after: afterPost },
        put: { before: beforePost }
    });
    return router;
};
