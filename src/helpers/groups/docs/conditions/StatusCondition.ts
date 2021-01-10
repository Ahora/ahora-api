import { literal, Op } from "sequelize";
import OrganizationStatus from "../../../../models/docStatuses";
import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class StatusCondition implements ICondition {
    getFieldName(): string {
        return "statusId";
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const query = `SELECT id FROM "${OrganizationStatus.tableName}" WHERE ("organizationId"=${organization.id} OR "organizationId" is null) AND lower(name) IN (${values.map((status) => `'${status.toLowerCase()}'`).join(",")})`;
        return { [Op.in]: [literal(query)] }
    }
}