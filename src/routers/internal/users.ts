import { Request, Response, NextFunction } from "express";
import routeCreate from "./../base";
import User from "../../models/users";
import UserSource, { UserAuthSource } from "../../models/userSource";

const handlePostError = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        res.status(409).send();
    }
    else {
        next(error);
    }
}

const beforePost = async (entity: UserSource, req?: Request): Promise<UserSource> => {
    const user = await User.create({
        username: entity.username,
        email: entity.email,
        avatar: entity.avatar
    });

    entity.userId = user.id;
    return entity;
}

export default (path: string) => {
    const router = routeCreate(path, UserSource, (req) => {
        return {
            post: { handleError: handlePostError, before: beforePost },
            put: { disable: true },
            delete: { disable: true }
        }
    });

    return router;
};