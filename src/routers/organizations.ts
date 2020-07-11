import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import Organization, { OrganizationType } from "../models/organization";
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
            id: currentUserPermissions.map(per => per.organizationId)
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

    router.get(`/api/organizations/:login/payment`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.org && req.orgPermission && req.orgPermission.permissionType == TeamUserType.Owner) {
                const organization = await Organization.findOne({ where: { id: req.org.id } });
                res.send(organization!.paymentInfo);
            }
            else {
                next();
            }
        } catch (error) {
            next(error);
        }
    });

    router.post(`/api/organizations/:login/payment`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.org && req.orgPermission && req.orgPermission.permissionType == TeamUserType.Owner) {
                Organization.update({ paymentInfo: req.body }, { where: { id: req.org.id } });
                res.send();
            }
            else {
                next();
            }
        } catch (error) {
            next(error);
        }
    });

    router.get(`/api/availableorg/:login`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const org = await Organization.findOne({ where: { login: req.params.login } });
            res.send(org === null);

        } catch (error) {
            next(error);
        }
    })

    router.use(routeCreate(`${path}/teams`, OrganizationTeam));
    return router;
};