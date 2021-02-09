import { literal, Op } from "sequelize";
import Label from "../../../../models/labels";
import OrganizationMilestone from "../../../../models/milestones";
import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class LabelCondition implements ICondition {
    getFieldName(): string {
        return "id";
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        const labelOrs = values.map((label: string) => {
            return {
                name: {
                    [Op.iLike]: label
                }
            }
        });

        const labels: Label[] = await Label.findAll({
            attributes: ["id"],
            where: {
                organizationId: organization.id,
                [Op.or]: labelOrs
            }
        });

        const labelIds: number[] = labels.map((label) => label.id);
        if (labelIds.length > 0) {
            const labelsQuery = `SELECT "docId" FROM doclabels as "docquery" WHERE "labelId" in (${labelIds.join(",")}) GROUP BY "docId" HAVING COUNT(*) = ${labelIds.length} `;
            return { [Op.in]: [literal(labelsQuery)] }
        }
        else {
            return -1
        }
    }
}
