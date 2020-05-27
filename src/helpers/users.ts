
import User from "./../models/users";
import { RestCollectorClient } from "rest-collector";
import db from "../models";
const githubUserClient: RestCollectorClient = new RestCollectorClient("https://api.github.com/users/{username}");


export const getUserFromGithubAlias = async (username: string): Promise<User | null> => {
    const result = await githubUserClient.get({
        params: { username }
    });

    const gitHubUser = result.data;
    if (!gitHubUser) {
        return null;
    }

    let user: User | null = await User.findOne({
        where: { gitHubId: gitHubUser.id.toString() }
    });

    if (!user) {
        user = await User.create({
            displayName: gitHubUser.name,
            gitHubId: gitHubUser.id,
            username
        });
    }

    return user;
}