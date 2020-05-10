import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DateGroupHandler implements IGroupHandler {

    constructor(private group: string) { };

    public handleGroup(): IGroupParameters {
        return {
            attributes: [[db.sequelize.fn('date_trunc', 'week', db.sequelize.col(this.group)), this.group + "val"]],
            group: [this.group + "val"]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row[this.group + "val"]
        }
    }
}