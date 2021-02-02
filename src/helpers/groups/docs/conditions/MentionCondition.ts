import { literal, Op, } from "sequelize";
import { buildQuery } from "../../../../models";
import Mention from "../../../../models/mention";
import Organization from "../../../../models/organization";
import OrganizationTeamUser from "../../../../models/organizationTeamsUsers";
import User from "../../../../models/users";
import UserGroupMentionCondition from "./UserGroupCondition";
const queryGenerator: any = OrganizationTeamUser.sequelize!.getQueryInterface().QueryGenerator;

export default class MentionCondition extends UserGroupMentionCondition {

    constructor() {
        super("");
    }
    getFieldName(): string | any {
        return Op.and;
    }


    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const result: any = await super.generate(values, organization, currentUser);

        const mentionsQuery: string = buildQuery(
            Mention.tableName, {
            where: {
                userId: result
            },
            attributes: ["docId"]
        });

        const watchersQuery: string = buildQuery(
            Mention.tableName, {
            where: {
                userId: result
            },
            attributes: ["docId"]
        });

        return {
            [Op.or]: [
                { id: { [Op.in]: [literal(mentionsQuery)] } },
                { id: { [Op.in]: [literal(watchersQuery)] } }
            ]
        }
    }

}