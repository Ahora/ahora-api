import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import { Request } from "express";
import db from "../../../models";
import OrganizationMilestone from "../../../models/milestones";

export default class DocMilestoneGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["milestone.title"],
            includes: [{ as: "milestone", model: OrganizationMilestone, attributes: ["title"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["milestone.title"]
        }
    }
}