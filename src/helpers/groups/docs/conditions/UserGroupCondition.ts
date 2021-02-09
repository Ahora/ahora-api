import { literal, Op } from "sequelize";
import { buildQuery } from "../../../../models";
import Organization from "../../../../models/organization";
import OrganizationTeamUser from "../../../../models/organizationTeamsUsers";
import User, { UserType } from "../../../../models/users";
import ICondition from "./ICondition";

export default class UserGroupMentionCondition implements ICondition {

    constructor(protected fieldName: string) {

    }
    getFieldName(): string {
        return this.fieldName;
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        let hasNull: boolean = false;
        const userIds: any[] = values.map((usernameOrId: string) => {
            switch (usernameOrId) {
                case "me":
                    if (currentUser) {
                        return currentUser.id;
                    } else {
                        return null
                    }
                case null:
                    hasNull = true;
                    return null;
                default:
                    return parseInt(usernameOrId);
            }
        });

        const users: User[] = await User.findAll({
            where: { id: userIds },
            attributes: ["id", "userType", "teamId"]
        });

        const conditions: any[] = [];


        users.forEach((currentUser) => {
            conditions.push(currentUser.id);
            if (currentUser.userType === UserType.Group) {
                const query: string = buildQuery(
                    OrganizationTeamUser.tableName, {
                    where: {
                        teamId: currentUser.teamId
                    },
                    attributes: ["userId"]
                });
                conditions.push({ [Op.in]: [literal(query)] });
                conditions.push(currentUser.id);
            }
        });

        if (hasNull) {
            conditions.push(null)
        }

        return {
            [Op.or]: conditions
        }
    }

}