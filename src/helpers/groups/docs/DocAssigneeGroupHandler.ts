import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";
import User from "../../../models/users";

export default class DocAssigneeGroupHandler implements IGroupHandler {

    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["assignee.username", "assignee.displayName"],
            includes: [
                { as: "assignee", model: User, attributes: ["displayName", "username"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["assignee.username"]
        }
    }
}