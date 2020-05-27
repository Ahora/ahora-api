import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";
import DocLabel from "../../../models/docLabel";
import Label from "../../../models/labels";

export default class DocLabelGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };

    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["labels->tags.name", "labels->tags.id"],
            includes: [
                { as: "labels", model: DocLabel, attributes: [], include: { as: "tags", raw: true, tableName: "tags", model: Label, attributes: ["name"] } }]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row["labels.tags.name"]
        }
    }
}