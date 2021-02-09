import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";
import DocType from "../../../models/docType";

export default class DocDocTypeGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["docType.code"],
            includes: [{ as: "docType", model: DocType, attributes: ["code"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["docType.code"]
        }
    }
}