import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import db from "../../../models";

export default class DateGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor(private group: string) {
        this.groupable = true;
    };

    public handleGroup(): IGroupParameters {
        return {
            attributes: [[db.sequelize.fn('date_trunc', 'day', db.sequelize.col(`docs.${this.group}`)), this.group]],
            group: [this.group]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row[this.group]
        }
    }
}