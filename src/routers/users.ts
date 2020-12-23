import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { literal, Op } from "sequelize";
import User from "../models/users";
import { OrganizationType } from "../models/organization";

const handlePostError = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        res.status(409).send();
    }
    else {
        next(error);
    }
}

const getAdditionalParams = async (req: Request): Promise<any> => {
    if (req.query.q) {
        return {
            [Op.or]: [
                {
                    username: {
                        [Op.iLike]: `%${req.query.q}%`
                    }
                },
                {
                    displayName: {
                        [Op.iLike]: `%${req.query.q}%`
                    }
                }
            ]
        }
    }
    else {
        return req.query;
    }
}

export default (path: string) => {
    const router = routeCreate(path, User, (req) => {
        return {
            post: { handleError: handlePostError },
            getSingle: { getAdditionalParams, useOnlyAdditionalParams: true, attributes: ["id", "username", "displayName", "avatar", "authSource"] },
            get: { getAdditionalParams, useOnlyAdditionalParams: true, attributes: ["id", "username", "displayName", "avatar", "authSource"] },
            put: { disable: true },
            delete: { disable: true }
        }
    });

    return router;
};