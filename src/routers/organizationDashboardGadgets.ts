import express, { Router, Request, Response, NextFunction } from "express";
import Sequelize from "sequelize";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "../models/index";
import marked from "marked";
import { addUserToWatchersList } from "../helpers/docWatchers";
import { notifyComment } from "../helpers/notifier";
import { IDashboardGadgetAttributes, IDashboardGadgetInstance } from "../models/organizationDashboardGadgets.ts";

const generateQuery = async (req: Request): Promise<any> => {
    return {
        dashboardId: parseInt(req.params.dashboardId)
    }
}

const beforePost = async (gadget: IDashboardGadgetAttributes, req: Request): Promise<IDashboardGadgetAttributes> => {
    if (req.user) {
        gadget.userId = gadget.userId || req.user.id;
    }
    gadget.dashboardId = parseInt(req.params.dashboardId);
    gadget.createdAt = gadget.createdAt || new Date();
    gadget.updatedAt = gadget.updatedAt || new Date();
    return gadget;
}

const beforePut = async (gadget: IDashboardGadgetAttributes, req: Request): Promise<IDashboardGadgetAttributes> => {
    gadget.updatedAt = gadget.updatedAt || new Date();
    return gadget;
}

export default (path: string) => {

    const router = routeCreate<IDashboardGadgetInstance, IDashboardGadgetAttributes>(path, db.organizationDashboardGadgets, (req) => {
        return {
            get: {
                getAdditionalParams: generateQuery,
                order: [["updatedAt", "DESC"]],
                include: [{ model: db.users, attributes: ["displayName", "username"] }]
            },
            post: { before: beforePost },
            put: { before: beforePut },
        }
    });
    return router;
};
