import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./base";
import DocSourceLabel from "../models/docsourcelabel";
import Label from "../models/labels";

interface DocLabelInput {
    sourceId: number,
    name: string,
    color: string,
    description: string
}

const generateQuery = async (req: Request): Promise<any> => {
    return {
        docSourceId: parseInt(req.params.docSourceId)
    }
}

export default (path: string) => {

    const router = routeCreate(path, DocSourceLabel, (req) => {
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

            let docSourceLabelFromDB: DocSourceLabel | null = await DocSourceLabel.findOne({
                where: {
                    docSourceId: docSourceId,
                    sourceId: docLabelInput.sourceId
                }
            });

            let label: Label | null = null;
            if (docSourceLabelFromDB) {
                label = await Label.findOne({ where: { id: docSourceLabelFromDB.labelId } });
            }

            // Try to find relevant label by name!
            if (label === null) {
                label = await Label.findOne({ where: { organizationId: req.org!.id, name: docLabelInput.name } });
            }

            //Update or create label if it's doesn't exists or name or description or color where changed
            if (label === null) {
                try {
                    label = await Label.create({
                        organizationId: req.org!.id,
                        name: docLabelInput.name,
                        description: docLabelInput.description,
                        color: docLabelInput.color
                    });
                } catch (error) {
                    if (error.name !== "SequelizeUniqueConstraintError") {
                        throw error;
                    }
                    else {
                        label = await Label.findOne({ where: { organizationId: req.org!.id, name: docLabelInput.name } });
                    }
                }

            }

            if (label && (label.name !== docLabelInput.name ||
                label.description !== docLabelInput.description ||
                label.color !== docLabelInput.color)) {

                await Label.update({
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
                    await DocSourceLabel.update({
                        docSourceId,
                        labelId: label!.id,
                        name: docLabelInput.name,
                        description: docLabelInput.description,
                        color: docLabelInput.color,
                        sourceId: docLabelInput.sourceId
                    }, {
                        where: { id: docSourceLabelFromDB.id }
                    });

                }
            }
            else {
                try {
                    docSourceLabelFromDB = await DocSourceLabel.create({
                        docSourceId,
                        labelId: label!.id,
                        name: docLabelInput.name,
                        description: docLabelInput.description,
                        color: docLabelInput.color,
                        sourceId: docLabelInput.sourceId
                    })
                } catch (error) {
                    if (error.name !== "SequelizeUniqueConstraintError") {
                        throw error;
                    }
                    else {
                        docSourceLabelFromDB = await DocSourceLabel.findOne({ where: { docSourceId, sourceId: docLabelInput.sourceId } });
                    }
                }

            }

            //Return final and upserted, if needed doc source label
            res.send(docSourceLabelFromDB);
        } catch (error) {
            next(error);
        }
    });
    return router;
};
