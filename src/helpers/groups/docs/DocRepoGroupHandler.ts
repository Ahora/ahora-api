import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DocRepoGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["repo"],
            includes: [
                { as: "source", model: db.docSources, attributes: ["repo"] }
            ]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["source.repo"]
        }
    }
}