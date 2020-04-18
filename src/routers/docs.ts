import { Request, Response, NextFunction } from "express";
import { IDocInstance, IDocAttributes } from "../models/docs";
import routeCreate from "./base";
import db from "./../models/index";
import marked from "marked";
import { IOrganizationInstance } from "../models/organization";
import { IDocStatusInstance } from "../models/docStatuses";
import { isArray } from "util";
import { IUserInstance } from "../models/users";
import { IDocLabelAttributes } from "../models/docLabel";
import { ILabelInstance } from "../models/labels";
import { getUserFromGithubAlias } from "../helpers/users";
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

    if (req.user) {
        await addUserToWatchersList(doc.id, req.user!.id);
    }

    return doc;
}

const afterGet = async (doc: IDocInstance, req: Request): Promise<any> => {
    const labels: IDocLabelAttributes[] | undefined = doc.labels as any;
    return {
        id: doc.id,
        docId: doc.docId,
        subject: doc.subject,
        description: doc.description,
        htmlDescription: doc.htmlDescription,
        assigneeUserId: doc.assigneeUserId,
        assignee: doc.assignee,
        reporter: doc.reporter,
        docTypeId: doc.docTypeId,
        metadata: doc.metadata,
        organizationId: doc.organizationId,
        statusId: doc.statusId,
        updatedAt: doc.updatedAt,
        closedAt: doc.closedAt,
        commentsNumber: doc.commentsNumber,
        views: doc.views,
        createdAt: doc.createdAt,
        lastView: (doc.lastView && doc.lastView.length) > 0 ? doc.lastView[0] : null,
        reporterUserId: doc.reporterUserId,
        labels: labels && labels.map(label => label.labelId)
    };
}

const afterGetSingle = async (doc: IDocInstance, req: Request): Promise<any> => {
    const returnedDoc: IDocInstance = await afterGet(doc, req);

    if (req.user) {
        var promiseUpSert = db.docUserView.upsert({
            userId: req.user.id,
            docId: doc.id
        });

        var PromiseIncrement = doc.increment({
            'views': 1
        });

        await Promise.all([promiseUpSert, PromiseIncrement]);
    }

    return returnedDoc;
}


const beforePost = async (doc: IDocAttributes, req: Request): Promise<IDocAttributes> => {
    const updatedDoc = await generateDocHTML(doc);
    if (req && req.org) {
        updatedDoc.statusId = doc.statusId || req.org.defaultStatus;
        updatedDoc.organizationId = req.org.id;
    }

    doc.createdAt = doc.createdAt || new Date();
    doc.updatedAt = doc.updatedAt || new Date();

    if (req.user) {
        doc.assigneeUserId = req.user.id;
        doc.reporterUserId = req.user.id;
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
        query.statusId = statusIds;
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

        if (labelIds.length > 0) {
            const labelsQuery = `SELECT "docId" FROM doclabels as "docquery" WHERE "labelId" in (${labelIds.join(",")}) GROUP BY "docId" HAVING COUNT(*)=${labelIds.length}`;
            query.id = { $in: [db.sequelize.literal(labelsQuery)] }
        }
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

    if (req.query.docId) {
        query.docId = req.query.docId;
    }

    return query;
}


const generateDocHTML = async (doc: IDocAttributes): Promise<IDocAttributes> => {

    doc.createdAt = doc.createdAt || new Date();
    doc.updatedAt = doc.updatedAt || new Date();

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
    const router = routeCreate<IDocInstance, IDocAttributes>(path, db.docs, (req) => {

        let after: ((doc: IDocInstance, req: Request) => Promise<any>) | undefined;
        let group: any, attributes: any, limit: number | undefined, order: any | undefined;
        let raw: boolean = false;
        let includes: any[] = [];

        if (req && req.query.group) {
            switch (req.query.group) {
                case "repoter":
                    group = ["reporter.username", "reporter.displayName", "reporter.id"]
                    attributes = [[db.sequelize.fn('COUNT', '*'), 'count']];
                    includes = [{ as: "reporter", model: db.users, attributes: ["displayName", "username"] }]
                    break;
                case "assignee":
                    group = ["assignee.username", "assignee.displayName", "assignee.id"]
                    attributes = [[db.sequelize.fn('COUNT', '*'), 'count']];
                    includes = [{ as: "assignee", model: db.users, attributes: ["displayName", "username"] }]
                    break;
                case "status":
                    group = ["status.name", "status.id"]
                    attributes = [[db.sequelize.fn('COUNT', '*'), 'count']];
                    includes = [{ as: "status", model: db.docStatuses, attributes: ["name"] }]
                    break;
                case "docTypeId":
                    group = ["docType.name", "docType.id"]
                    attributes = [[db.sequelize.fn('COUNT', '*'), 'count']];
                    includes = [{ as: "docType", model: db.docTypes, attributes: ["name"] }]
                    break;
                case "label":
                    group = ["labelId"]
                    attributes = [[db.sequelize.fn('COUNT', '*'), 'count']];
                    includes = [{ as: "labels", model: db.docLabels, attributes: ["labelId"] }];
                    raw = true;
                    break;
                default:
                    group = [req.query.group]
                    attributes = [req.query.group, [db.sequelize.fn('COUNT', '*'), 'count']];
                    break;
            }
        }
        else {
            includes = [
                { as: "assignee", model: db.users, attributes: ["displayName", "username"] },
                { as: "reporter", model: db.users, attributes: ["displayName", "username"] },
                { as: "labels", model: db.docLabels, attributes: ["labelId"] }
            ];

            if (req && req.user) {
                includes.push({ required: false, as: "lastView", model: db.docUserView, attributes: ["updatedAt"], where: { userId: req.user.id } })
            }
            after = afterGet
            limit = 30;
            order = [["updatedAt", "DESC"]]
        }


        return {
            get: {
                getAdditionalParams: generateQuery,
                useOnlyAdditionalParams: true,
                after: after,
                group,
                limit,
                raw,
                order,
                attributes,
                include: includes
            },
            getSingle: {
                getAdditionalParams: generateQuery,
                useOnlyAdditionalParams: true,
                after: afterGetSingle,
                include: includes
            },
            post: { before: beforePost, after: afterPostOrPut },
            put: { before: generateDocHTML, after: afterPostOrPut }
        }
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
