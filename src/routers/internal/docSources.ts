import express, { Router, Request, Response, NextFunction, request } from "express";
import DocSource from "../../models/docSource";
import { literal, Op, where } from "sequelize";
import Organization from "../../models/organization";
import db from "../../models";
import users from "../users";
import User from "../../models/users";
import OrganizationTeamUser from "../../models/organizationTeamsUsers";
import UserSource, { UserAuthSource } from "../../models/userSource";

const router: Router = express.Router();

router.get("/internal/docsources", async (req: Request, res: Response, next: NextFunction) => {
    try {
        var since = new Date();
        since.setMinutes(since.getMinutes() - 3);
        const docSources = await DocSource.findAll({
            where: {
                [Op.or]: [
                    { lastUpdated: { [Op.lte]: since } },
                    { lastUpdated: null }
                ]
            },
            include: [
                { model: Organization, as: "organizationFK", attributes: ["login"] }
            ],
            order: ["organizationId"]
        });

        res.send(docSources);
    } catch (error) {
        next(error);
    }
});



router.put("/internal/docsources/:docSourceId", async (req: Request, res: Response, next: NextFunction) => {
    try {
        await DocSource.update(req.body, {
            where: { id: req.params.docSourceId }
        });
        res.send();
    } catch (error) {
        next(error);
    }
});

router.get("/internal/organizations/:organizationId/accesstokens", async (req: Request, res: Response, next: NextFunction) => {
    try {

        const organizationId = parseInt(req.params.organizationId);
        const query = `SELECT "userId" FROM "${OrganizationTeamUser.tableName}" WHERE "organizationId"=${organizationId}`;
        const users = await UserSource.findAll({
            attributes: ["accessToken"],
            where: {
                authSource: UserAuthSource.Github,
                accessToken: { [Op.not]: null },
                userId: { [Op.in]: [literal(query)] }
            }
        });
        res.send(users.map((user) => user.accessToken));
    } catch (error) {
        next(error);
    }
});

export default router;
