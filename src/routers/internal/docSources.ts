import express, { Router, Request, Response, NextFunction, request } from "express";
import DocSource from "../../models/docSource";
import { Op } from "sequelize";
import Organization from "../../models/organization";
import db from "../../models";
import OrganizationTeamUser from "../../models/organizationTeamsUsers";
import User from "../../models/users";

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
                {
                    model: Organization, as: "organizationFK", include: [
                        {
                            model: OrganizationTeamUser, required: false, attributes: ["User.accessToken"], include: [
                                { model: User }
                            ]
                        }
                    ]
                }
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

export default router;
