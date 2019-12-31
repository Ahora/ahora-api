import routeCreate from "./base";
import db from "../models/index";
import { IOrganizationUserInstance, IOrganizationUserAttribute } from "../models/organizationUsers";
import { Request } from "express";
import { IUserInstance } from "../models/users";


import { RestCollectorClient } from "rest-collector";

const githubUserClient: RestCollectorClient = new RestCollectorClient("https://api.github.com/users/{username}");

const getAdditionalParams = async (req: Request): Promise<any> => {
    if (req && req.org) {
        return { organizationId: req.org.id };
    }
}


const beforePost = async (userToAdd: IOrganizationUserAttribute, req: Request): Promise<IOrganizationUserAttribute> => {
    if (req && req.org) {
        userToAdd.organizationId = req.org.id;
    }

    const username: string = req.body!.login;

    const result = await githubUserClient.get({
        params: { username }
    });
    console.log(result);

    const gitHubUser = result.data;

    let user: IUserInstance | null = await db.users.findOne({
        where: { gitHubId: gitHubUser.id.toString() }
    });

    if (!user) {
        user = await db.users.create({
            displayName: gitHubUser.name,
            gitHubId: gitHubUser.id,
            username
        });
    }

    userToAdd.userId = user.id;
    return userToAdd;
}


const afterPost = async (userToAdd: IOrganizationUserInstance, req: Request): Promise<IOrganizationUserInstance> => {
    return new Promise<IOrganizationUserInstance>((resolve) => {
        const returnValue: any = {
            userId: userToAdd.userId,
            permission: userToAdd.permission,
            organizationId: userToAdd.organizationId,
            id: userToAdd.id,
            user: { username: req.body.login }
        };
        resolve(returnValue);
    });
}

export default (path: string) => {
    const router = routeCreate<IOrganizationUserInstance, IOrganizationUserAttribute>(path, db.organizationUsers, {
        get: {
            getAdditionalParams,
            include: [
                { model: db.users, attributes: ["displayName", "username"] }
            ]
        },
        post: {
            before: beforePost,
            after: afterPost
        }
    });
    return router;
};
