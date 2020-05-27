import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import Organization, { OrganizationType } from "../models/organization";
import { Op } from "sequelize";
import OrganizationTeamUser, { TeamUserType } from "../models/organizationTeamsUsers";
import OrganizationTeam from "../models/organizationTeams";


//Create default statuses, update default status.
const afterPost = async (org: Organization, req: Request): Promise<Organization> => {

    const orgId: number = org.id!;
    await Organization.update({
        defaultStatus: 1,
    }, { where: { id: orgId } });


    if (req.user) {
        await OrganizationTeamUser.create({
            organizationId: orgId,
            userId: req.user.id,
            permissionType: TeamUserType.Owner,
            teamId: null
        });
    }

    return org;
};

const handlePostError = (error: any, req: Request, res: Response, next: NextFunction) => {
    if (error.name === "SequelizeUniqueConstraintError") {
        res.status(409).send();
    }
    else {
        next(error);
    }
}

const getAdditionalParams = async (req: Request): Promise<any> => {
    if (req.user) {
        const currentUserPermissions: OrganizationTeamUser[] = await OrganizationTeamUser.findAll({
            attributes: ["organizationId"],
            where: { userId: req.user!.id }
        });
        return {
            [Op.or]: [
                { id: currentUserPermissions.map(per => per.organizationId) },
                { orgType: OrganizationType.Public }
            ]
        }
    }
    else {
        return { orgType: OrganizationType.Public };
    }
}

export default (path: string) => {
    const router = routeCreate(path, Organization, (req) => {
        return {
            primaryField: "login",
            post: { after: afterPost, handleError: handlePostError },
            get: {
                getAdditionalParams: getAdditionalParams
            }
        }
    });

    router.use(routeCreate(`${path}/teams`, OrganizationTeam));
    return router;
};