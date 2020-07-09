import BaseSync from "./BaseSync";
import { Request } from "express";
import DocSource from "../../models/docSource";
import Label from "../../models/labels";
import DocSourceMilestone from "../../models/docsourcemilestone";
import OrganizationMilestone from "../../models/milestones";

export default class DocSourceMilestoneSync extends BaseSync<DocSourceMilestone> {

    constructor() {
        super(DocSourceMilestone);
    }

    protected async beforeSave(entity: DocSourceMilestone, req: Request): Promise<DocSourceMilestone> {

        const objToUpdate: any = {
            title: entity.title,
            description: entity.description,
            dueOn: entity.dueOn,
            state: entity.state,
            closedAt: entity.closedAt,
            organizationId: entity.organizationId
        }


        const [milestoneFromDB] = await OrganizationMilestone.upsert(objToUpdate, { returning: true });
        entity.milestoneId = milestoneFromDB.id;

        return entity;
    };


    protected async convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<DocSourceMilestone> {
        return new DocSourceMilestone(body);
    }

} 