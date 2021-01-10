import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { literal, Op } from "sequelize";
import User from "../models/users";
import { OrganizationType } from "../models/organization";

const getAdditionalParams = async (req: Request): Promise<any> => {
    const query: any = {};

    /*//Search relevant users onbly for private organizations.
    if (req.org!.orgType === OrganizationType.Private) {
        //const usersQuery = `SELECT "userId" FROM organizationteamsusers WHERE "organizationId"=${req.org!.id}`;
        //query.id = { [Op.in]: [literal(usersQuery)] };
    }
    else {
        //Allow to search only github accounts for public organizations
        query.authSource = UserAuthSource.Github;
    }
    */


    if (req.query.q) {
        query[Op.or] = [
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
        ];
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