import BaseSync from "./BaseSync";
import Comment from "../../models/comments"
import { Request } from "express";
import { markdownToHTML } from "../../helpers/markdown";
import DocSource from "../../models/docSource";
import db from "../../models";
import { updateCommentsNumberAndTime } from "../../helpers/comments";
import DocSourceLabel from "../../models/docsourcelabel";
import Label from "../../models/labels";

export default class DocSourceLabelSync extends BaseSync<DocSourceLabel> {

    constructor() {
        super(DocSourceLabel);
    }

    async upsert(model: any, values: any, condition: any): Promise<any> {
        const obj = await model.findOne({ where: condition })
        if (obj) {
            // only do update is value is different from queried object from db
            for (var key in values) {
                const val = values[key]
                if (parseFloat(obj[key]) !== val) {
                    obj.isUpdatedRecord = true
                    return obj.update(values)
                }
            }
            obj.isUpdatedRecord = false
            return obj

        } else {
            // insert
            const merged = { ...values, ...condition }
            return model.create(merged)
        }
    }

    protected async beforeSave(entity: DocSourceLabel, req: Request): Promise<DocSourceLabel> {

        const objToUpdate: any = {
            name: entity.name,
            color: entity.color,
            description: entity.description,
            organizationId: entity.organizationId
        }

        const labelFromDB = await this.upsert(Label, objToUpdate, { organizationId: entity.organizationId, name: entity.name });

        entity.labelId = labelFromDB.id;
        return entity;
    };


    protected async convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<DocSourceLabel> {
        return new DocSourceLabel(body);
    }

} 