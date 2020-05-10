import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DocAssigneeGroupHandler implements IGroupHandler {
    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["assignee.username", "assignee.displayName"],
            includes: [
                { as: "assignee", model: db.users, attributes: ["displayName", "username"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["assignee.username"]
        }
    }
}