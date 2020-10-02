import { Request } from "express";
import routeCreate from "./base";
import { Op } from "sequelize";
import Organization from "../models/organization";
import DocSource from "../models/docSource";
import { syncDocSource } from "../helpers/syncHelper";

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

    return query;
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string) => {
    const router = routeCreate<TInstance, TAttributes, TCreationAttributes>(path, DocSource, (req) => {
        return {
            get: { getAdditionalParams: generateQuery, order: [["updatedAt", "DESC"]] },
            post: { before: beforePost }
        }
    });

    router.post(`${path}/:id/sync/`, async (req, res, next) => {
        try {
            const orgQuery = await generateQuery(req);
            const docSource = await DocSource.findOne({
                where: {
                    ...orgQuery,
                    id: req.params.id
                }
            });

            if (docSource) {
                syncDocSource(docSource);
                res.send();
            }
            else {
                res.status(404).send();
            }
        } catch (error) {
            next(error);
        }

    })
    return router;
};
