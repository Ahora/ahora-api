import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import { IOrganizationInstance, IOrganizationAttributes } from "../models/organization";
import { IDocStatusInstance } from "../models/docStatuses";

//Create default statuses, update default status.
const afterPost = async (doc: IOrganizationAttributes, req: Request): Promise<IOrganizationAttributes> => {
    const orgId: number = doc.id!;

    const openedStatus: IDocStatusInstance = await db.docStatuses.create({name: "Opened", organizationId: orgId});
    await db.docStatuses.create({name: "Closed", organizationId: orgId});

    await db.organizations.update({
        defaultStatus: openedStatus.id
    }, { where: { organizationId: orgId } });
    
    return doc;
};
export default (path: string) => {

    const router  = routeCreate<IOrganizationInstance, IOrganizationAttributes>(path, db.organizations, { 
        post: { after: afterPost },
    });
    return router;
};
