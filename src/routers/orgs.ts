import express, { Router, Request, Response, NextFunction } from "express";
import Octokit from "@octokit/rest";
import db from "../models";
import { IOrganizationInstance } from "../models/organization";

const router: Router = express.Router();

router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const user: any = req.user;
        const octokit = new Octokit({
            auth: user.accessToken
        });
    const orgsResponse: Octokit.Response<Octokit.OrgsListResponse> = await octokit.orgs.listForAuthenticatedUser();
    const simpleArray =orgsResponse.data.map(org => { return { login: org.login } });
    res.send(orgsResponse.data);
    } catch (error) {
        next(error);
    }
});

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
        const orgFromDB: IOrganizationInstance = await  db.organizations.create(req.body);
        res.send(orgFromDB);
    } catch (error) {
        next(error);
    }
});

export default router;