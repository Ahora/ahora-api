import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate, { RouterHooks } from "./base";
import db from "./../models/index";
import marked from "marked";
import { IOrganizationInstance } from "../models/organization";
import { IDocStatusInstance } from "../models/docStatuses";
import { isArray } from "util";
import { IUserInstance } from "../models/users";
import { IDocLabelAttributes } from "../models/docLabel";
import { ILabelAttributes, ILabelInstance } from "../models/labels";
import { getUserFromGithubAlias } from "../helpers/users";
import connectPgSimple from "connect-pg-simple";
import { addUserToWatchersList, unWatch } from "../helpers/docWatchers";

const afterPostOrPut = async (doc: IDocInstance, req: Request): Promise<IDocInstance> => {
    //Update labels!
    const labelIds: number[] | undefined = req.body.labels;
    if (labelIds) {
        const itemsToAdd: IDocLabelAttributes[] = labelIds.map((id: number) => {
            return {
                docId: doc.id,
                labelId: id
            }
        });

        await db.docLabels.destroy({
            where: { docId: doc.id }
        });
        await db.docLabels.bulkCreate(itemsToAdd);
    }

    await addUserToWatchersList(doc.id, req.user!.id);


    return doc;
}

const afterGet = async (doc: IDocInstance, req: Request): Promise<any> => {
    const labels: IDocLabelAttributes[] | undefined = doc.labels as any;
    return {
        id: doc.id,
        subject: doc.subject,
        description: doc.description,
        htmlDescription: doc.htmlDescription,
        assigneeUserId: doc.assigneeUserId,
        assignee: doc.assignee,
        docTypeId: doc.docTypeId,
        metadata: doc.metadata,
        organizationId: doc.organizationId,
        status: doc.status,
        updatedAt: doc.updatedAt,
        createdAt: doc.createdAt,
        labels: labels && labels.map(label => label.labelId)
    };
}

const beforePost = async (doc: IDocAttributes, req: Request): Promise<IDocAttributes> => {
    const updatedDoc = await generateDocHTML(doc);
    if (req && req.org) {
        updatedDoc.status = req.org.defaultStatus;
        updatedDoc.organizationId = req.org.id;
    }

    if (req.user) {
        doc.assigneeUserId = req.user.id;
    }

    return doc;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: IOrganizationInstance = req.org!;
    const query: any = { organizationId: currentOrg.id };

    //--------------Status-------------------------------------------------
    const statuses: IDocStatusInstance[] = await db.docStatuses.findAll({ where: { organizationId: currentOrg.id } });
    const Statusmap: Map<string, IDocStatusInstance> = new Map();
    statuses.forEach(status => {
        Statusmap.set(status.name.toLowerCase(), status);
    });


    if (req.query.status) {
        if (typeof (req.query.status) === "string") {
            req.query.status = [req.query.status];
        }
    }

    if (isArray(req.query.status)) {
        const statusIds: number[] = [];
        req.query.status.forEach((statusName: string) => {
            const value: IDocStatusInstance | undefined = Statusmap.get(statusName.toLowerCase());
            if (value) {
                statusIds.push(value.id);
            }
        });
        query.status = statusIds;
    }

    //--------------Label-------------------------------------------------
    const labels: ILabelInstance[] = await db.labels.findAll({ where: { organizationId: currentOrg.id } });
    const labelMap: Map<string, ILabelInstance> = new Map();
    labels.forEach(label => {
        labelMap.set(label.name.toLowerCase(), label);
    });

    if (req.query.label) {
        if (typeof (req.query.label) === "string") {
            req.query.label = [req.query.label];
        }
    }

    if (isArray(req.query.label)) {
        const labelIds: number[] = [];
        req.query.label.forEach((statusName: string) => {
            const value: ILabelInstance | undefined = labelMap.get(statusName.toLowerCase());
            if (value) {
                labelIds.push(value.id);
            }
        });

        query["$labelsquery.labelId$"] = labelIds;
    }

    //--------------Assignee-------------------------------------------------

    if (req.query.assignee) {
        if (typeof (req.query.assignee) === "string") {
            req.query.assignee = [req.query.assignee];
        }
    }

    if (req.query.assignee) {
        req.query.assignee = req.query.assignee.map((assignee: string) => {
            switch (assignee) {
                case "me":
                    if (req.user) {
                        return req.user.username;
                    } else {
                        return undefined
                    }
                case "null":
                    return null;
                default:
                    return assignee;
            }
        });

        const usersWithoutNull: string[] = req.query.assignee.filter((assignee: string) => assignee !== null);

        const userIds: (number | null)[] = await db.users.findAll({
            where: { username: usersWithoutNull },
            attributes: ["id"]
        }).map((user) => user.id);


        if (usersWithoutNull.length !== req.query.assignee.length) {
            userIds.push(null);
        }

        query.assigneeUserId = userIds;
    }


    if (req.query.docType) {
        if (typeof (req.query.docType) === "string") {
            req.query.docType = [req.query.docType];
        }
    }

    if (req.query.docType) {
        const docTypes: (number | null)[] = await db.docTypes.findAll({
            where: { code: req.query.docType, organizationId: currentOrg.id },
            attributes: ["id"]
        }).map((docType) => docType.id);

        query.docTypeId = docTypes;
    }

    return query;
}


const generateDocHTML = async (doc: IDocAttributes): Promise<IDocAttributes> => {
    return new Promise<IDocAttributes>((resolve, reject) => {
        if (doc.description) {
            marked(doc.description, (error: any, parsedResult: string) => {
                if (error) {
                    reject(error);
                }
                else {
                    doc.htmlDescription = parsedResult;
                    resolve(doc);
                }
            });
        }
        else {
            resolve(doc);
        }
    });
}

export default (path: string) => {
    const router = routeCreate<IDocInstance, IDocAttributes>(path, db.docs, {
        get: {
            getAdditionalParams: generateQuery,
            useOnlyAdditionalParams: true,
            after: afterGet,
            include: [
                { as: "assignee", model: db.users, attributes: ["displayName", "username"] },
                { as: "labels", model: db.docLabels, attributes: ["labelId"] },
                { as: "labelsquery", model: db.docLabels, attributes: [] }
            ]
        },
        post: { before: beforePost, after: afterPostOrPut },
        put: { before: generateDocHTML, after: afterPostOrPut }
    });

    router.post(`${path}/:id/assignee`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username: string = req.body.username;
            const user: IUserInstance | null = await getUserFromGithubAlias(username);
            if (user) {
                await db.docs.update({
                    assigneeUserId: user.id
                }, { where: { id: req.params.id } });
                res.send(user);
            } else {
                res.status(400).send();
            }
        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/watch`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user) {
                const watcher = await addUserToWatchersList(parseInt(req.params.id), req.user.id);
                console.log(watcher);
                res.send(watcher);
            } else {
                res.status(400).send();
            }
        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/unwatch`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (req.user) {
                const watcher = await unWatch(parseInt(req.params.id), req.user.id)
                res.send(watcher);
            } else {
                res.status(400).send();
            }
        } catch (error) {
            next(error);
        }
    });
    return router;
};
