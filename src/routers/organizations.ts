import {Request } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { IOrganizationInstance, IOrganizationAttributes } from "../models/organization";
import { IDocStatusInstance } from "../models/docStatuses";

//Create default statuses, update default status.
const afterPost = async (org: IOrganizationAttributes, req: Request): Promise<IOrganizationAttributes> => {
    
    const orgId: number = org.id!;

    const openedStatus: IDocStatusInstance = await db.docStatuses.create({name: "Opened", organizationId: orgId});
    await db.docStatuses.create({name: "Closed", organizationId: orgId});

    await db.organizations.update({
        defaultStatus: openedStatus.id
    }, { where: { id: orgId } });


    await db.organizationUsers.create({
        organizationId: orgId,
        userId: req.user!.id,
        permission: 2
    });
    
    return org;
};

const getAdditionalParams = async (req: Request): Promise<any> => {
    if(req.user) {
        const currentUserPermissions = await db.organizationUsers.findAll({
            attributes: ["organizationId"],
            where: { userId: req.user!.id}
        });
        return { id: currentUserPermissions.map(per => per.organizationId) }
    }
}

export default (path: string) => {
    const router  = routeCreate<IOrganizationInstance, IOrganizationAttributes>(path, db.organizations, { 
        post: { after: afterPost },
        get: {
            getAdditionalParams: getAdditionalParams
        }
    });
    return router;
};