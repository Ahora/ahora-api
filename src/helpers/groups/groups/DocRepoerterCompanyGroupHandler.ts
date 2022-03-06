import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";
import User from "../../../models/users";

export default class DocRepoerterCompanyGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["reporter.company"],
            includes: [{ as: "reporter", model: User, attributes: ["company"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["reporter.company"]
        }
    }
}