import { literal, Op } from "sequelize";
import Organization from "../../../../models/organization";
import OrganizationTeamUser from "../../../../models/organizationTeamsUsers";
import User, { UserType } from "../../../../models/users";
import ICondition from "./ICondition";
const queryGenerator: any = OrganizationTeamUser.sequelize!.getQueryInterface().QueryGenerator;


export default class UserGroupMentionCondition implements ICondition {

    constructor(protected fieldName: string) {

    }
    getFieldName(): string {
        return this.fieldName;
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const t = values.map((username: string) => {
            switch (username) {
                case "me":
                    if (currentUser) {
                        return currentUser.username;
                    } else {
                        return null
                    }
                default:
                    return username;
            }
        });

        const usersWithoutNull: string[] = t.filter((username) => username !== null) as any;
        const users: User[] = await User.findAll({
            where: {
                [Op.or]: [
                    {
                        organizationId: organization.id,
                        username: usersWithoutNull
                    }, {
                        organizationId: null,
                        username: usersWithoutNull
                    }
                ]
            },
            attributes: ["id", "userType", "teamId"]
        });

        const orConditions = users.map((currentUser) => {
            if (currentUser.userType === UserType.User) {
                return currentUser.id;
            }
            else {
                const query: string = queryGenerator.selectQuery(
                    OrganizationTeamUser.tableName, {
                    where: {
                        teamId: currentUser.teamId
                    },
                    attributes: ["userId"]
                });
                return { [Op.in]: [literal(query)] }
            }
        })

        return {
            [Op.or]: orConditions
        }
    }

}