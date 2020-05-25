import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DocMilestoneGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["milestone.name"],
            includes: [{ as: "milestone", model: db.milestones, attributes: ["title"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["milestone.name"]
        }
    }
}