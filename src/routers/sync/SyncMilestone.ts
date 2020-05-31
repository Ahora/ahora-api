import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "../base";
import DocSourceMilestone from "../../models/docsourcemilestone";
import Milestone from "../../models/milestones";
import { MilestoneStatus } from "../../models/milestones";

interface DocMilestoneInput {
    id?: number;
    title: string;
    description: string;
    createdAt: Date;
    updatedAt: Date;
    sourceId: number;
    closedAt?: Date;
    dueOn?: Date;
    state: MilestoneStatus
}
const router = express.Router();

router.post(`/docsources/:docSourceId/milestones`, async (req: Request, res: Response, next: NextFunction) => {
    try {
        const docSourceId = parseInt(req.params.docSourceId);
        const docMilestoneInput: DocMilestoneInput = req.body;


        let docSourceMilestoneFromDB: DocSourceMilestone | null = await DocSourceMilestone.findOne({
            where: {
                docSourceId: docSourceId,
                sourceId: docMilestoneInput.sourceId
            }
        });

        let milestone: Milestone | null = null;
        if (docSourceMilestoneFromDB) {
            milestone = await Milestone.findOne({ where: { id: docSourceMilestoneFromDB.milestoneId } });

        }


        // Try to find relevant milestone by title!
        if (milestone === null) {
            milestone = await Milestone.findOne({ where: { organizationId: req.org!.id, title: docMilestoneInput.title } });
        }

        //Update or create milestone if it's doesn't exists or title or description or color where changed
        if (milestone === null) {
            try {
                milestone = await Milestone.create({
                    organizationId: req.org!.id,
                    title: docMilestoneInput.title,
                    description: docMilestoneInput.description,
                    closedAt: docMilestoneInput.closedAt,
                    doOn: docMilestoneInput.dueOn,
                    state: docMilestoneInput.state
                });

            } catch (error) {
                if (error.title !== "SequelizeUniqueConstraintError") {
                    throw error;
                }
                else {
                    milestone = await Milestone.findOne({ where: { organizationId: req.org!.id, title: docMilestoneInput.title } });
                }
            }

        }

        if (milestone && (milestone.title !== docMilestoneInput.title ||
            milestone.description !== docMilestoneInput.description ||
            milestone.state !== docMilestoneInput.state ||
            milestone.closedAt !== docMilestoneInput.closedAt ||
            milestone.dueOn !== docMilestoneInput.dueOn)) {

            await Milestone.update({
                organizationId: req.org!.id,
                title: docMilestoneInput.title,
                description: docMilestoneInput.description,
                closedAt: docMilestoneInput.closedAt,
                doOn: docMilestoneInput.dueOn,
                state: docMilestoneInput.state
            }, { where: { id: milestone.id } });
        }


        //Update or create doc Source milestone if it's doesn't exists or title or description or color where changed
        if (docSourceMilestoneFromDB) {
            if (docSourceMilestoneFromDB.title !== docMilestoneInput.title ||
                docSourceMilestoneFromDB.description !== docMilestoneInput.description ||
                docSourceMilestoneFromDB.state !== docMilestoneInput.state ||
                docSourceMilestoneFromDB.dueOn !== docMilestoneInput.dueOn ||
                docSourceMilestoneFromDB.closedAt !== docMilestoneInput.closedAt) {

                await DocSourceMilestone.update({
                    docSourceId,
                    milestoneId: milestone!.id,
                    title: docMilestoneInput.title,
                    description: docMilestoneInput.description,
                    closedAt: docMilestoneInput.closedAt,
                    doOn: docMilestoneInput.dueOn,
                    state: docMilestoneInput.state
                }, {
                    where: { id: docSourceMilestoneFromDB.id }
                });

            }
        }
        else {
            try {

                docSourceMilestoneFromDB = await DocSourceMilestone.create({
                    docSourceId,
                    milestoneId: milestone!.id,
                    title: docMilestoneInput.title,
                    description: docMilestoneInput.description,
                    dueOn: docMilestoneInput.dueOn,
                    closedAt: docMilestoneInput.closedAt,
                    sourceId: docMilestoneInput.sourceId
                })
            } catch (error) {
                if (error.title !== "SequelizeUniqueConstraintError") {
                    throw error;
                }
                else {

                    docSourceMilestoneFromDB = await DocSourceMilestone.findOne({ where: { docSourceId, sourceId: docMilestoneInput.sourceId } });
                }
            }

        }

        //Return final and upserted, if needed doc source milestone
        res.send(docSourceMilestoneFromDB);
    } catch (error) {
        next(error);
    }
});

export default router;
