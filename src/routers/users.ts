import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { Op } from "sequelize";
import User from "../models/users";

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
            get: { getAdditionalParams: getAdditionalParams, useOnlyAdditionalParams: true },
            put: { disable: true },
            delete: { disable: true }
        }
    });

    return router;
};