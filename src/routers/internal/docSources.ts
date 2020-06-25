import express, { Router, Request, Response, NextFunction, request } from "express";
import DocSource from "../../models/docSource";
import { Op } from "sequelize";
import Organization from "../../models/organization";

const router: Router = express.Router();

router.get("/internal/docsources", async (req: Request, res: Response, next: NextFunction) => {
    try {
        var since = new Date();
        since.setHours(since.getMinutes() - 3);
        const docSources = await DocSource.findAll({
            where: {
                [Op.or]: [
                    { lastUpdated: { [Op.lte]: since } },
                    { lastUpdated: null }
                ],
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

export default router;
