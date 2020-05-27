import { Request } from "express";
import routeCreate from "./base";
import db from "../models/index";
import Sequelize, { Op } from "sequelize";
import Organization from "../models/organization";

const beforePost = async (entity: any, req: Request): Promise<any> => {
    if (req && req.org) {
        entity.organizationId = req.org.id;
    }

    return entity;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: Organization = req.org!;
    const query: any = {
        [Op.or]: [
            { organizationId: null },
            { organizationId: currentOrg.id }
        ]
    };

    return query;
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string, model: any) => {
    const router = routeCreate<TInstance, TAttributes, TCreationAttributes>(path, model, (req) => {
        return {
            get: { getAdditionalParams: generateQuery, order: [["updatedAt", "DESC"]] },
            post: { before: beforePost }
        }
    });
    return router;
};
