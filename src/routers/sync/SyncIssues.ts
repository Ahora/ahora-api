import express, { Router, Request, Response, NextFunction } from "express";
import Doc from "../../models/docs";
import DocLabel from "../../models/docLabel";
import marked from "marked";


const router = express.Router();

const generateDocHTML = async (doc: Doc): Promise<Doc> => {
    return new Promise<Doc>((resolve, reject) => {
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
        let docInput = req.body as Doc;

        docInput = await generateDocHTML(docInput);

        //Update doc source id from params!
        docInput.docSourceId = docSourceId;
        if (req.org) {
            docInput.organizationId = req.org.id;
        }

        let docFromDB: Doc | null = await Doc.findOne({
            where: {
                docSourceId: docSourceId,
                sourceId: docInput.sourceId
            }
        });

        if (docFromDB) {
            await Doc.update(docInput, { where: { id: docFromDB.id } });
        }
        else {
            docFromDB = await Doc.create(docInput);
        }


        if (docFromDB) {

            //Update labels!
            const labelIds: number[] | undefined = req.body.labels;
            if (labelIds) {
                const itemsToAdd: any[] = labelIds.map((labelId: number) => {
                    return {
                        docId: docFromDB!.id,
                        labelId: labelId
                    };
                });

                await DocLabel.destroy({
                    where: { docId: docFromDB.id }
                });

                try {
                    await DocLabel.bulkCreate(itemsToAdd);

                } catch (error) {
                    console.log("errrrrrrrrrrrrrrrrrrrrr", docFromDB!.id);
                    console.log(error, itemsToAdd);
                }
            }
        }

        res.send(docFromDB);
    } catch (error) {
        next(error);
    }
});

export default router;
