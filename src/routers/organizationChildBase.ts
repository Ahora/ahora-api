import { Request } from "express";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import Sequelize from "sequelize";
import { IOrganizationInstance } from "../models/organization";

const beforePost = async (entity: any, req: Request): Promise<any> => {
    if (req && req.org) {
        entity.organizationId = req.org.id;
    }

    return entity;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: IOrganizationInstance = req.org!;
    const query: any = { organizationId: currentOrg.id };
    return query;
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>) => {
    const router = routeCreate<TInstance, TAttributes, TCreationAttributes>(path, model, (req) => {
        return {
            get: { getAdditionalParams: generateQuery, order: [["updatedAt", "DESC"]] },
            post: { before: beforePost }
        }
    });
    return router;
};
