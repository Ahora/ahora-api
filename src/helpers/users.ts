
import { IUserInstance } from "./../models/users";
import { RestCollectorClient } from "rest-collector";
import db from "../models";
const githubUserClient: RestCollectorClient = new RestCollectorClient("https://api.github.com/users/{username}");


export const getUserFromGithubAlias = async (username: string): Promise<IUserInstance | null> => {
    const result = await githubUserClient.get({
        params: { username }
    });

    const gitHubUser = result.data;
    if (!gitHubUser) {
        return null;
    }

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

    return user;
}