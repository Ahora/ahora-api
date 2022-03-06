import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";
import User from "../../../models/users";

export default class DocRepoerterLocationGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["reporter.location"],
            includes: [{ as: "reporter", model: User, attributes: ["location"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["reporter.location"]
        }
    }
}