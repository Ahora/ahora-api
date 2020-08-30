import { Request } from "express";
import routeCreate from "./base";
import { Op } from "sequelize";
import Organization from "../models/organization";
import OrganizationTeam from "../models/organizationTeams";

const beforePost = async (entity: any, req: Request): Promise<any> => {
    if (req && req.org) {
        entity.organizationId = req.org.id;
    }

    return entity;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: Organization = req.org!;
    const query: any = { organizationId: currentOrg.id }

    if (req.query.q) {
        query[Op.or] = [
            {
                name: {
                    [Op.iLike]: `%${req.query.q}%`
                }
            }
        ];
    }

    return query;
}

export default (path: string) => {
    const router = routeCreate(path, OrganizationTeam, (req) => {
        return {
            get: { getAdditionalParams: generateQuery, useOnlyAdditionalParams: true, order: [["updatedAt", "DESC"]] },
            post: { before: beforePost }
        }
    });
    return router;
};
