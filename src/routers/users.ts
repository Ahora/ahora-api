import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import { literal, Op } from "sequelize";
import User from "../models/users";
import { OrganizationType } from "../models/organization";
import { UserAuthSource } from "../models/userSource";

const getAdditionalParams = (req: Request): any => {
    const query: any = {};

    if (req.query.userType) {
        query.userType = req.query.userType;
    }

    const usersQuery = `SELECT "userId" FROM organizationteamsusers WHERE "organizationId"=${req.org!.id}`;

    const ors: any = {};
    ors.id = { [Op.in]: [literal(usersQuery)] };

    if (req.org!.defaultDomain) {
        ors.email = { [Op.iLike]: `%${req.org?.defaultDomain}` }
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
            getSingle: { getAdditionalParams, useOnlyAdditionalParams: true, attributes: ["id", "username", "displayName", "avatar"] },
            get: { order: [["displayName", "asc"]], getAdditionalParams, useOnlyAdditionalParams: true, attributes: ["id", "username", "displayName", "avatar"] },
            put: { getAdditionalParams, disable: true },
            delete: { getAdditionalParams, disable: true }
        }
    });

    return router;
};