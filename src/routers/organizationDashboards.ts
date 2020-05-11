import express, { Request } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { ICommentAttributes, ICommentInstance } from "../models/comments";
import { IDashboardAttributes, IDashboardInstance, DashboardType } from "../models/organizationDashboards";
import { Op } from "sequelize";

const generateQuery = async (req: Request): Promise<any> => {
    if (req.user) {
        return {
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

const beforePost = async (dashboard: IDashboardAttributes, req: Request): Promise<IDashboardAttributes> => {
    if (req.user) {
        dashboard.userId = dashboard.userId || req.user.id;
    }

    if (req && req.org) {
        dashboard.organizationId = req.org.id;
    }
    return dashboard;
}

export default (path: string) => {

    const router = routeCreate<IDashboardInstance, IDashboardAttributes>(path, db.organizationDashboards, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                order: [["updatedAt", "DESC"]],
                include: [{ model: db.users, attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost },
        }
    });
    return router;
};
