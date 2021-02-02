import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import { literal, Op } from "sequelize";
import User, { UserType } from "../models/users";
import { buildQuery } from "../models";
import OrganizationTeamUser from "../models/organizationTeamsUsers";

const getAdditionalParams = (req: Request): any => {
    const query: any = {};

    if (req.query.userType) {
        query.userType = req.query.userType;
    }

    const usersQuery = buildQuery(OrganizationTeamUser.tableName, {
        attributes: ["userId"],
        where: { organizationId: req.org!.id }
    });

    //Add default organization users
    const ors: any[] = [
        {
            id: { [Op.in]: [literal(usersQuery)] }
        },
        {
            organizationId: req.org!.id
        }];

    if (req.org!.defaultDomain) {
        ors.push({ email: { [Op.iLike]: `%${req.org?.defaultDomain}` } });
    }

    query[Op.or] = ors;

    if (req.query.q) {
        query[Op.and] = {
            [Op.or]: [
                {
                    username: {
                        [Op.iLike]: `%${req.query.q.trim()}%`
                    }
                },
                {
                    displayName: {
                        [Op.iLike]: `%${req.query.q.trim()}%`
                    }
                }
            ]
        };
    }

    return query;
}

export default (path: string) => {
    const router = routeCreate(path, User, (req) => {
        return {
            post: { disable: true },
            getSingle: { getAdditionalParams, useOnlyAdditionalParams: true, attributes: ["id", "username", "displayName", "avatar", "userType"] },
            get: { order: [["displayName", "asc"]], getAdditionalParams, useOnlyAdditionalParams: true, attributes: ["id", "username", "displayName", "avatar", "userType"] },
            put: { getAdditionalParams, disable: true },
            delete: { getAdditionalParams, disable: true }
        }
    });

    return router;
};