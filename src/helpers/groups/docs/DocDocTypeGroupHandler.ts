import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DocDocTypeGroupHandler implements IGroupHandler {
    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["docType.name"],
            includes: [{ as: "docType", model: db.docTypes, attributes: ["name"] }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["docType.name"]
        }
    }
}