import { Request, Response, NextFunction } from "express";
import routeCreate from "./../base";
import User from "../../models/users";

const handlePostError = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        res.status(409).send();
    }
    else {
        next(error);
    }
}

export default (path: string) => {
    const router = routeCreate(path, User, (req) => {
        return {
            post: { handleError: handlePostError },
            put: { disable: true },
            delete: { disable: true }
        }
    });

    return router;
};