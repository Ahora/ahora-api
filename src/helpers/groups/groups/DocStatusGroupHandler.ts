import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";
import OrganizationStatus from "../../../models/docStatuses";

export default class DocStatusGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["status.name"],
            includes: [{ as: "status", model: OrganizationStatus, attributes: ["name"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["status.name"]
        }
    }
}