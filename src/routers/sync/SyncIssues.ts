import express, { Router, Request, Response, NextFunction } from "express";
import routeCreate, { RouterHooks } from "./../base";
import db from "../../models/index";
import { IDocSourceLabelAttributes, IDocSourceLabelInstance } from "../../models/docsourcelabel";
import { ILabelInstance } from "../../models/labels";
import { IDocAttributes, IDocInstance } from "../../models/docs";
import { IDocLabelAttributes } from "../../models/docLabel";
import marked from "marked";


const router = express.Router();

const generateDocHTML = async (doc: IDocAttributes): Promise<IDocAttributes> => {
    return new Promise<IDocAttributes>((resolve, reject) => {
        if (doc.description) {
            marked(doc.description, (error: any, parsedResult: string) => {
                if (error) {
                    reject(error);
                }
                else {
                    doc.htmlDescription = parsedResult;
                    resolve(doc);
                }
            });
        }
        else {
            resolve(doc);
        }
    });
}

router.post("/docsources/:docSourceId/issues", async (req: Request, res: Response, next: NextFunction) => {
    try {
        const docSourceId = parseInt(req.params.docSourceId);
        let docInput = req.body as IDocAttributes;


        docInput = await generateDocHTML(docInput);

        //Update doc source id from params!
        docInput.docSourceId = docSourceId;
        if (req.org) {
            docInput.organizationId = req.org.id;
        }

        let docFromDB: IDocInstance | null = await db.docs.findOne({
            where: {
                docSourceId: docSourceId,
                sourceId: docInput.sourceId
            }
        });

        if (docFromDB) {
            await db.docs.update(docInput, { where: { id: docFromDB.id } });
        }
        else {
            docFromDB = await db.docs.create(docInput);
        }

        //Update labels!
        const labelIds: number[] | undefined = req.body.labels;
        if (labelIds) {
            const itemsToAdd: IDocLabelAttributes[] = labelIds.map((id: number) => {
                return {
                    docId: docFromDB!.id,
                    labelId: id
                }
            });

            await db.docLabels.destroy({
                where: { docId: docFromDB.id }
            });
            await db.docLabels.bulkCreate(itemsToAdd);
        }

        res.send(docFromDB);
    } catch (error) {
        next(error);
    }
});

export default router;
