import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DocRepoterGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["reporter.username", "reporter.displayName"],
            includes: [{ as: "reporter", model: db.users, attributes: ["displayName", "username"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["reporter.username"]
        }
    }
}