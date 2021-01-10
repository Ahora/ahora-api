import { literal, Op, where } from "sequelize";
import db from "../../../../models";
import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import UserGroupMentionCondition from "./UserGroupCondition";

export default class MentionCondition extends UserGroupMentionCondition {

    constructor() {
        super("");
    }
    getFieldName(): string {
        return "id";
    }



    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {

        const result: any = await super.generate(values, organization, currentUser);
        console.log();



        const mentionsQuery = `SELECT DISTINCT "docId" FROM mentions WHERE "userId" in (${where(result, "")}`;
        const watchersQuery = `SELECT DISTINCT "docId" FROM docwatchers WHERE "userId" (${where(result, "")}`;
        return {
            [Op.or]: [
                { id: { [Op.in]: [literal(mentionsQuery)] } },
                { id: { [Op.in]: [literal(watchersQuery)] } }
            ]
        }

    }

}