import { literal, Op } from "sequelize";
import { buildQuery } from "../../../../models";
import DocUserView from "../../../../models/docUserView";
import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class StarCondition implements ICondition {
    getFieldName(): string | any {
        return Op.and;
    }

    getValues(values: string[]) {
        switch (values[0]) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                return [true, false]
        }

    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const valuesForQuery: any = this.getValues(values);

        const starQuery: string = buildQuery(
            DocUserView.tableName, {
            where: {
                userId: currentUser!.id,
                star: valuesForQuery

            },
            attributes: ["docId"]
        });

        return { id: { [Op.in]: [literal(starQuery)] } };
    }
}