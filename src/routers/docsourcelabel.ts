import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import { IDocSourceLabelAttributes, IDocSourceLabelInstance } from "../models/docsourcelabel";
import { ILabelInstance } from "../models/labels";

interface DocLabelInput {
    "id": number,
    "name": string,
    "color": string,
    "default": boolean,
    "description": string
}

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docSourceId: parseInt(req.params.docSourceId)
    }
}

export default (path: string) => {

    const router = routeCreate<IDocSourceLabelInstance, IDocSourceLabelAttributes>(path, db.docSourceLabels, (req) => {
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
            const docLabelInput: DocLabelInput = req.body;

            let docSourceLabelFromDB: IDocSourceLabelInstance | null = await db.docSourceLabels.findOne({
                where: {
                    docSourceId: docSourceId,
                    sourceId: docLabelInput.id
                }
            });

            let label: ILabelInstance | null = null;
            if (docSourceLabelFromDB) {
                label = await db.labels.findOne({ where: { id: docSourceLabelFromDB.labelId } });
            }

            // Try to find relevant label by name!
            if (label === null) {
                label = await db.labels.findOne({ where: { organizationId: req.org!.id, name: docLabelInput.name } });
            }

            //Update or create label if it;s doesn't exists or name or description or color where changed
            if (label === null) {
                label = await db.labels.create({
                    organizationId: req.org!.id,
                    name: docLabelInput.name,
                    description: docLabelInput.description,
                    color: docLabelInput.color
                });
            }

            if ((label.name !== docLabelInput.name ||
                label.description !== docLabelInput.description ||
                label.color !== docLabelInput.color)) {

                await db.labels.update({
                    organizationId: req.org!.id,
                    name: docLabelInput.name,
                    description: docLabelInput.description,
                    color: docLabelInput.color
                }, { where: { id: label.id } });
            }


            //Update or create doc Source label if it's doesn't exists or name or description or color where changed
            if (docSourceLabelFromDB) {
                if (docSourceLabelFromDB.name !== docLabelInput.name ||
                    docSourceLabelFromDB.description !== docLabelInput.description ||
                    docSourceLabelFromDB.color !== docLabelInput.color) {
                    await db.docSourceLabels.update({
                        docSourceId,
                        labelId: label.id,
                        name: docLabelInput.name,
                        description: docLabelInput.description,
                        color: docLabelInput.color,
                        sourceId: docLabelInput.id
                    }, {
                        where: { id: docSourceLabelFromDB.id }
                    });

                }
            }
            else {
                docSourceLabelFromDB = await db.docSourceLabels.create({
                    docSourceId,
                    labelId: label.id,
                    name: docLabelInput.name,
                    description: docLabelInput.description,
                    color: docLabelInput.color,
                    sourceId: docLabelInput.id
                })
            }

            //Return final and upserted, if needed doc source label
            res.send(docSourceLabelFromDB);
        } catch (error) {
            next(error);
        }
    });
    return router;
};
