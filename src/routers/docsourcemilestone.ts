import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import { IDocSourceMilestoneAttributes, IDocSourceMilestoneInstance } from "../models/docsourcemilestone";
import { IMilestoneInstance, MilestoneStatus } from "../models/milestones";

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

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docSourceId: parseInt(req.params.docSourceId)
    }
}

export default (path: string) => {

    const router = routeCreate<IDocSourceMilestoneInstance, IDocSourceMilestoneAttributes>(path, db.docSourceMilestones, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery
            },
            put: { disable: true },
            post: { disable: true }
        }
    });


    router.post(`${path}`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const docSourceId = parseInt(req.params.docSourceId);
            const docMilestoneInput: DocMilestoneInput = req.body;


            let docSourceMilestoneFromDB: IDocSourceMilestoneInstance | null = await db.docSourceMilestones.findOne({
                where: {
                    docSourceId: docSourceId,
                    sourceId: docMilestoneInput.sourceId
                }
            });

            let milestone: IMilestoneInstance | null = null;
            if (docSourceMilestoneFromDB) {
                milestone = await db.milestones.findOne({ where: { id: docSourceMilestoneFromDB.milestoneId } });
            }

            // Try to find relevant milestone by name!
            if (milestone === null) {
                milestone = await db.milestones.findOne({ where: { organizationId: req.org!.id, title: docMilestoneInput.title } });
            }

            //Update or create milestone if it;s doesn't exists or name or description or color where changed
            if (milestone === null) {
                milestone = await db.milestones.create({
                    organizationId: req.org!.id,
                    title: docMilestoneInput.title,
                    description: docMilestoneInput.description,
                    closedAt: docMilestoneInput.closedAt,
                    state: docMilestoneInput.state,
                    dueOn: docMilestoneInput.dueOn,
                });
            }

            if ((milestone.title !== docMilestoneInput.title ||
                milestone.description !== docMilestoneInput.description ||
                milestone.dueOn !== docMilestoneInput.dueOn ||
                milestone.closedAt !== docMilestoneInput.closedAt)) {

                await db.milestones.update({
                    organizationId: req.org!.id,
                    title: docMilestoneInput.title,
                    description: docMilestoneInput.description,
                    dueOn: docMilestoneInput.dueOn,
                    state: docMilestoneInput.state,
                    closedAt: docMilestoneInput.closedAt
                }, { where: { id: milestone.id } });
            }


            //Update or create doc Source milestone if it's doesn't exists or name or description or color where changed
            if (docSourceMilestoneFromDB) {
                if (docSourceMilestoneFromDB.title !== docMilestoneInput.title ||
                    docSourceMilestoneFromDB.description !== docMilestoneInput.description ||
                    docSourceMilestoneFromDB.dueOn !== docMilestoneInput.dueOn ||
                    docSourceMilestoneFromDB.state !== docMilestoneInput.state ||
                    docSourceMilestoneFromDB.closedAt !== docMilestoneInput.closedAt) {
                    await db.docSourceMilestones.update({
                        docSourceId,
                        milestoneId: milestone.id,
                        title: docMilestoneInput.title,
                        description: docMilestoneInput.description,
                        closedAt: docMilestoneInput.closedAt,
                        state: docMilestoneInput.state,
                        dueOn: docMilestoneInput.dueOn,
                        sourceId: docMilestoneInput.id
                    }, {
                        where: { id: docSourceMilestoneFromDB.id }
                    });

                }
            }
            else {
                docSourceMilestoneFromDB = await db.docSourceMilestones.create({
                    milestoneId: milestone.id,
                    docSourceId,
                    description: docMilestoneInput.description,
                    sourceId: docMilestoneInput.sourceId,
                    state: docMilestoneInput.state,
                    title: docMilestoneInput.title,
                    closedAt: docMilestoneInput.closedAt,
                    dueOn: docMilestoneInput.dueOn,
                });
            }

            //Return final and upserted, if needed doc source milestone
            res.send(docSourceMilestoneFromDB);
        } catch (error) {
            next(error);
        }
    });
    return router;
};
