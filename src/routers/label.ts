import { Request } from "express";
import routeCreate from "./base";
import { Op } from "sequelize";
import Organization from "../models/organization";
import DocSource from "../models/docSource";
import { syncDocSource } from "../helpers/syncHelper";
import Label from "../models/labels";

const beforePost = async (entity: any, req: Request): Promise<any> => {
    if (req && req.org) {
        entity.organizationId = req.org.id;
    }

    return entity;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: Organization = req.org!;
    const query: any = {
        organizationId: currentOrg.id
    };

    if (req.query.q) {
        query.name = {
            [Op.iLike]: `%${req.query.q}%`
        };
    }
    return query;
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string) => {
    const router = routeCreate<TInstance, TAttributes, TCreationAttributes>(path, Label, (req) => {
        return {
            get: { getAdditionalParams: generateQuery, useOnlyAdditionalParams: true, order: [["name", "ASC"]] },
            post: { before: beforePost }
        }
    });
    return router;
};
