import express, { Router, Request, Response, NextFunction } from "express";
import { RestCollectorClient, RestCollectorRequest } from "rest-collector";
import User from "../models/users";

const router: Router = express.Router();

const githubSearchUsersClient = new RestCollectorClient("https://api.github.com/search/users", {
    decorateRequest: (req: RestCollectorRequest, bag: User) => {
        req.headers.Authorization = `token ${bag.accessToken}`;
    }
});

const githubRepoClient: RestCollectorClient = new RestCollectorClient("https://api.github.com/search/repositories");

router.get('/search/users', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const repositoriesResult = await githubSearchUsersClient.get({
            query: { q: `${req.query.q} in:login` },
            bag: req.user
        });

        res.send(repositoriesResult.data.items);
    } catch (error) {
        next(error);
    }
});

router.get('/search/repositories', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const q: string = req.query.q;
        const owner: string = req.query.owner;
        const isOrg: boolean = req.query.isOrg === "true";
        const repositoriesResult = await githubRepoClient.get({
            query: { q: `${isOrg ? "org" : "user"}:${owner} ${q} in:name fork:true` }
        });

        res.send(repositoriesResult.data.items);
    } catch (error) {
        next(error);
    }
});

export default router;