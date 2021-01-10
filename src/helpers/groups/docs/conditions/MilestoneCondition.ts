import { literal, Op } from "sequelize";
import OrganizationMilestone from "../../../../models/milestones";
import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class MilestoneCondition implements ICondition {
    getFieldName(): string {
        return "milestoneId";
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const query = `SELECT id FROM "${OrganizationMilestone.tableName}" WHERE "organizationId"=${organization.id} AND lower(title) IN (${values.map((milestone) => `'${milestone.toLowerCase()}'`).join(",")})`;
        return { [Op.in]: [literal(query)] }
    }
}