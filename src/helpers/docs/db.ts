import Label from "../../models/labels"
import OrganizationStatus from "../../models/docStatuses";
import { Op } from "sequelize/types";
import DocType from "../../models/docType";
import OrganizationMilestone from "../../models/milestones";
import User from "../../models/users";

export interface SearchCriterias {
    assignee?: string[];
    subject?: string[];
    description?: string[];
    reporter?: string[];
    label?: string[];
    status?: string[];
    repo?: string[];
    milestone?: string[];
    text?: string[]
    docType?: string[]
}

export interface SearchCriteriasByIds {
    assignee?: (number | null)[];
    subject?: string[];
    description?: string[];
    reporter?: (number | null)[];
    label?: (number | null)[];
    status?: (number | null)[];
    repo?: string[];
    milestone?: (number | null)[];
    text?: string[]
    docType?: (number | null)[]
}

export const getLabelIdsFromStrings = async (organizationId: number, labelNames?: string[]): Promise<number[] | undefined> => {
    if (labelNames) {
        const labels: Label[] = await Label.findAll({
            where: { organizationId, name: labelNames },
            attributes: ["id"]
        });

        return labels.map((label) => label.id);
    }
}

export const getStatusesFromStrings = async (organizationId: number, statusNames?: string[]): Promise<number[] | undefined> => {
    if (statusNames) {

        const statuses: OrganizationStatus[] = await OrganizationStatus.findAll({
            where: {
                [Op.or]: [
                    { organizationId },
                    { organizationId: null }
                ],
                name: statusNames
            },
            attributes: ["id"]
        });

        return statuses.map((status) => status.id);
    }
}

export const getDocTypesFromStrings = async (organizationId: number, docTypeNames?: string[]): Promise<number[] | undefined> => {
    if (docTypeNames) {
        const docTypes: DocType[] = await DocType.findAll({
            where: {
                [Op.or]: [
                    { organizationId },
                    { organizationId: null }
                ],
                name: docTypeNames
            },
            attributes: ["id"]
        });

        return docTypes.map((docType) => docType.id);
    }
}

export const getMilestonesFromStrings = async (organizationId: number, milestoneNames?: string[]): Promise<number[] | undefined> => {
    if (milestoneNames) {
        const milestones: OrganizationMilestone[] = await OrganizationMilestone.findAll({
            where: {
                organizationId,
                title: milestoneNames
            },
            attributes: ["id"]
        });

        return milestones.map((milestone) => milestone.id);
    }
}

export const getUsersFromStrings = async (usernames?: string[]): Promise<number[] | undefined> => {
    if (usernames) {
        const normalizedUsers: (string | null)[] = usernames.map((username: string) => {
            switch (username) {
                case "null":
                    return null;
                default:
                    return username;
            }
        });

        const usersWithoutNull: string[] = normalizedUsers.filter((user: string | null) => user) as any;

        const users: User[] = await User.findAll({
            where: { username: usersWithoutNull },
            attributes: ["id"]
        });

        //Convert user to if
        const userIds = users.map((user: any) => user.id);

        //Add null if it was reduced above from the array
        if (usersWithoutNull.length !== usernames.length) {
            userIds.push(null);
        }

        return userIds;
    }
}