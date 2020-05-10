import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DocLabelGroupHandler implements IGroupHandler {
    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["labels->tags.name", "labels->tags.id"],
            includes: [
                { as: "labels", model: db.docLabels, attributes: [], include: { as: "tags", raw: true, tableName: "tags", model: db.labels, attributes: ["name"] } }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["labels.tags.name"]
        }
    }
}