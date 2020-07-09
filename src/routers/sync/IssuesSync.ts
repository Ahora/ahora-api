import BaseSync from "./BaseSync";
import { Request } from "express";
import { markdownToHTML } from "../../helpers/markdown";
import DocSource from "../../models/docSource";
import Doc from "../../models/docs";
import DocLabel from "../../models/docLabel";

export default class IssuesSync extends BaseSync<Doc> {

    constructor() {
        super(Doc);
    }
    protected async afterSave(entity: Doc, req: Request): Promise<void> {

        const labelIds: number[] | undefined = req.body.labels;
        console.log(labelIds);
        if (labelIds) {
            const itemsToAdd: any[] = labelIds.map((id: number) => {
                return {
                    docId: entity.id,
                    labelId: id
                }
            });

            await DocLabel.destroy({
                where: { docId: entity.id }
            });
            await DocLabel.bulkCreate(itemsToAdd);
        }
    }

    protected async convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<Doc> {
        req.body.htmlDescription = await markdownToHTML(req.body.description, docSource);
        return req.body;
    }

} 