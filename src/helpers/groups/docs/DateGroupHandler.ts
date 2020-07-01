import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import { fn, col } from "sequelize";
import db from "../../../models";

export default class DateGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor(private group: string) {
        this.groupable = true;
    };

    public handleGroup(): IGroupParameters {
        return {
            attributes: [[fn('date_trunc', 'week', col(`${this.group}`)), this.group]],
            group: [fn('date_trunc', 'week', col(`${this.group}`)) as any]
        }
    }

    public changeData(row: any): GroupInfo {
        return {
            criteria: row[this.group]
        }
    }
}