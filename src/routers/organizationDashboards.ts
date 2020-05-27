import express, { Request } from "express";
import routeCreate from "./base";
import db from "../models/index";
import OrganizationDashboard, { DashboardType } from "../models/organizationDashboards";
import { Op } from "sequelize";
import User from "../models/users";
import Organization from "../models/organization";

const generateQuery = async (req: Request): Promise<any> => {
    if (req.user) {
        return {
            organizationId: req.org!.id,
            [Op.or]: [
                { userId: req.user.id },
                { dashboardType: DashboardType.Public }
            ]
        }
    }
    else {
        return {
            organizationId: req.org!.id,
            dashboardType: DashboardType.Public
        };
    }
}

const beforePost = async (dashboard: OrganizationDashboard, req: Request): Promise<OrganizationDashboard> => {
    if (req.user) {
        dashboard.userId = dashboard.userId || req.user.id;
    }

    if (req && req.org) {
        dashboard.organizationId = req.org.id;
    }
    return dashboard;
}

export default (path: string) => {

    const router = routeCreate(path, OrganizationDashboard, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                order: [["updatedAt", "DESC"]],
                include: [{ model: User, attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost },
        }
    });
    return router;
};
