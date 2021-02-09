import { RestCollectorRequest } from "rest-collector";
import User from "../../models/users";
import UserSource, { UserAuthSource } from "../../models/userSource";

export const decorateGithubRequest = async (req: RestCollectorRequest, bag: User) => {
    const githubDocSource = await UserSource.findOne({
        attributes: ["accessToken"],
        where: {
            userId: bag.id,
            authSource: UserAuthSource.Github
        }
    });
    if (githubDocSource) {
        req.headers.Authorization = `token ${githubDocSource.accessToken}`;
    }
}