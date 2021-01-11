import { literal, Op } from "sequelize";
import OrganizationStatus from "../../../../models/docStatuses";
import DocType from "../../../../models/docType";
import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class DocTypeCondition implements ICondition {
    getFieldName(): string {
        return "docTypeId";
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const query = `SELECT id FROM "${DocType.tableName}" WHERE ("organizationId"=${organization.id} OR "organizationId" is null) AND lower(name) IN (${values.map((docType) => `'${docType.toLowerCase()}'`).join(",")})`;
        return { [Op.in]: [literal(query)] }
    }
}