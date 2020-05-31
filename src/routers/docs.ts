import { Request, Response, NextFunction } from "express";
import Doc from "../models/docs";
import routeCreate from "./base";
import db from "./../models/index";
import { literal, fn } from "sequelize";
import marked from "marked";
import Organization from "../models/organization";
import { isArray } from "util";
import User from "../models/users";
import DocLabel from "../models/docLabel";
import Label from "../models/labels";
import { getUserFromGithubAlias } from "../helpers/users";
import { addUserToWatchersList, unWatch } from "../helpers/docWatchers";
import GroupByManager from "../helpers/groups/GroupByManager";
import DocRepoterGroupHandler from "../helpers/groups/docs/DocRepoterGroupHandler";
import DocAssigneeGroupHandler from "../helpers/groups/docs/DocAssigneeGroupHandler";
import DocStatusGroupHandler from "../helpers/groups/docs/DocStatusGroupHandler";
import DocLabelGroupHandler from "../helpers/groups/docs/DocLabelGroupHandler";
import DocDocTypeGroupHandler from "../helpers/groups/docs/DocDocTypeGroupHandler";
import { IGroupHandler, IGroupParameters, GroupInfo } from "../helpers/groups/IGroupHandler";
import DocRepoGroupHandler from "../helpers/groups/docs/DocRepoGroupHandler";
import DateGroupHandler from "../helpers/groups/docs/DateGroupHandler";
import { Op } from "sequelize";
import DocMilestoneGroupHandler from "../helpers/groups/docs/DocMilestoneGroupHandler";
import OrganizationStatus from "../models/docStatuses";
import DocType from "../models/docType";
import OrganizationMilestone from "../models/milestones";
import DocSource from "../models/docSource";
import DocUserView from "../models/docUserView";

const afterPostOrPut = async (doc: Doc, req: Request): Promise<Doc> => {
    //Update labels!
    const labelIds: number[] | undefined = req.body.labels;
    if (labelIds) {
        const itemsToAdd: DocLabel[] = labelIds.map((id: number) => {
            return new DocLabel({
                docId: doc.id,
                labelId: id
            })
        });

        await DocLabel.destroy({
            where: { docId: doc.id }
        });
        await DocLabel.bulkCreate(itemsToAdd);
    }

    if (req.user) {
        await addUserToWatchersList(doc.id, req.user!.id);
    }

    return doc;
}

const afterGet = async (doc: any, req: Request): Promise<any> => {
    const labels: Doc[] | undefined = doc.labels as any;

    let newSource: any = doc.source;
    if (doc.source) {
        newSource = {
            organization: doc.source.organization,
            repo: doc.source.repo,
            url: `https://github.com/${newSource.organization}/${newSource.repo}/issues/${doc.sourceId}`
        }
    }

    return {
        id: doc.id,
        sourceId: doc.sourceId,
        subject: doc.subject,
        description: doc.description,
        htmlDescription: doc.htmlDescription,
        assigneeUserId: doc.assigneeUserId,
        assignee: doc.assignee,
        reporter: doc.reporter,
        docTypeId: doc.docTypeId,
        metadata: doc.metadata,
        source: newSource,
        milestone: doc.milestone,
        organizationId: doc.organizationId,
        statusId: doc.statusId,
        updatedAt: doc.updatedAt,
        closedAt: doc.closedAt,
        commentsNumber: doc.commentsNumber,
        views: doc.views,
        createdAt: doc.createdAt,
        lastView: (doc.lastView && doc.lastView.length) > 0 ? doc.lastView[0] : null,
        reporterUserId: doc.reporterUserId,
        labels: labels && labels.map((label: any) => label.labelId)
    };
}

const afterGroupByGet = async (item: any, req: Request): Promise<any> => {
    const returnValue: any = { count: parseInt(item.count), criteria: {}, values: [] };
    if (req && req.query.group) {
        if (!Array.isArray(req.query.group)) {
            req.query.group = [req.query.group];
        }

        req.query.group.forEach((currentGroup: string) => {
            const groupHandler: IGroupHandler | undefined = groupByManager.getGroup(currentGroup);
            if (groupHandler) {
                let groupInfo: GroupInfo = groupHandler.changeData(item);
                returnValue.criteria = { ...returnValue.criteria, [currentGroup]: groupInfo.criteria };
                returnValue.values = [...returnValue.values, groupInfo.criteria];
            }
        });
    }

    return returnValue;
}

const afterGetSingle = async (doc: Doc, req: Request): Promise<any> => {
    const returnedDoc: Doc = await afterGet(doc, req);

    if (req.user) {
        var promiseUpSert = DocUserView.upsert({
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


const beforePost = async (doc: Doc, req: Request): Promise<Doc> => {
    const updatedDoc = await generateDocHTML(doc, req);
    if (req && req.org) {
        updatedDoc.statusId = doc.statusId || req.org.defaultStatus;
        updatedDoc.organizationId = req.org.id;
    }

    if (req.user) {
        doc.assigneeUserId = req.user.id;
        doc.reporterUserId = req.user.id;
    }

    return doc;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: Organization = req.org!;
    const query: any = { organizationId: currentOrg.id };

    //--------------Status-------------------------------------------------
    const statuses: OrganizationStatus[] = await OrganizationStatus.findAll({
        where: {
            [Op.or]: [
                { organizationId: currentOrg.id },
                { organizationId: null }
            ]
        }
    });
    const Statusmap: Map<string, OrganizationStatus> = new Map();
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
            const value: OrganizationStatus | undefined = Statusmap.get(statusName.toLowerCase());
            if (value) {
                statusIds.push(value.id);
            }
        });
        query.statusId = statusIds;
    }

    //--------------Label-------------------------------------------------
    const labels: Label[] = await Label.findAll({ where: { organizationId: currentOrg.id } });
    const labelMap: Map<string, Label> = new Map();
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
            const value: Label | undefined = labelMap.get(statusName.toLowerCase());
            if (value) {
                labelIds.push(value.id);
            }
        });

        if (labelIds.length > 0) {
            const labelsQuery = `SELECT "docId" FROM doclabels as "docquery" WHERE "labelId" in (${labelIds.join(",")}) GROUP BY "docId" HAVING COUNT(*) = ${labelIds.length} `;
            query.id = { $in: [literal(labelsQuery)] }
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

        const users: User[] = await User.findAll({
            where: { username: usersWithoutNull },
            attributes: ["id"]
        });

        const userIds = users.map((user: any) => user.id);
        if (usersWithoutNull.length !== req.query.assignee.length) {
            userIds.push(null);
        }

        query.assigneeUserId = userIds;
    }

    //--------------reporter-------------------------------------------------

    if (req.query.reporter) {
        if (typeof (req.query.reporter) === "string") {
            req.query.reporter = [req.query.reporter];
        }
    }

    if (req.query.reporter) {
        req.query.reporter = req.query.reporter.map((reporter: string) => {
            switch (reporter) {
                case "me":
                    if (req.user) {
                        return req.user.username;
                    } else {
                        return undefined
                    }
                case "null":
                    return null;
                default:
                    return reporter;
            }
        });

        const usersWithoutNull: string[] = req.query.reporter.filter((assignee: string) => assignee !== null);

        const users: User[] = await User.findAll({
            where: { username: usersWithoutNull },
            attributes: ["id"]
        });

        const userIds = users.map((user: any) => user.id);


        if (usersWithoutNull.length !== req.query.reporter.length) {
            userIds.push(null);
        }

        query.reporterUserId = userIds;
    }


    if (req.query.docType) {
        if (typeof (req.query.docType) === "string") {
            req.query.docType = [req.query.docType];
        }
    }

    if (req.query.docType) {
        const docTypes: (DocType)[] = await DocType.findAll({
            where: {
                code: req.query.docType, [Op.or]: [
                    { organizationId: currentOrg.id },
                    { organizationId: null }
                ]
            },
            attributes: ["id"]
        });

        const docTypesIds = docTypes.map((docType: any) => docType.id);
        query.docTypeId = docTypesIds;
    }

    // --------------------------------------------------------
    if (req.query.milestone) {
        if (typeof (req.query.milestone) === "string") {
            req.query.milestone = [req.query.milestone];
        }
    }

    if (req.query.milestone) {
        const milestones: OrganizationMilestone[] = await OrganizationMilestone.findAll({
            where: {
                title: req.query.milestone,
                organizationId: currentOrg.id
            },
            attributes: ["id"]
        });

        query.milestoneId = milestones.map((milestone: any) => milestone.id);;
    }

    if (req.query.docId) {
        query.docId = req.query.docId;
    }

    return query;
}


const generateDocHTML = async (doc: Doc, req: Request): Promise<Doc> => {
    return new Promise<Doc>((resolve, reject) => {
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

const groupByManager = new GroupByManager();
groupByManager.registerGroup("reporter", new DocRepoterGroupHandler());
groupByManager.registerGroup("assignee", new DocAssigneeGroupHandler());
groupByManager.registerGroup("status", new DocStatusGroupHandler());
groupByManager.registerGroup("label", new DocLabelGroupHandler());
groupByManager.registerGroup("repo", new DocRepoGroupHandler());
groupByManager.registerGroup("milestone", new DocMilestoneGroupHandler());
groupByManager.registerGroup("doctype", new DocDocTypeGroupHandler());
groupByManager.registerGroup("createdAt", new DateGroupHandler("createdAt"));
groupByManager.registerGroup("updatedAt", new DateGroupHandler("updatedAt"));


export default (path: string) => {
    const router = routeCreate(path, Doc, (req) => {
        let after: ((doc: Doc, req: Request) => Promise<any>) | undefined;
        let group: any = [], attributes: any[] = [], limit: number | undefined, order: any | undefined;
        let raw: boolean = false;
        let includes: any[] = [];

        if (req && req.query.group) {
            if (!Array.isArray(req.query.group)) {
                req.query.group = [req.query.group];
            }

            after = afterGroupByGet;
            attributes = [[fn('COUNT', '*'), 'count']];

            raw = true;
            req.query.group.forEach((currentGroup: string) => {

                const groupHandler: IGroupHandler | undefined = groupByManager.getGroup(currentGroup);
                if (groupHandler) {
                    const groupParameters: IGroupParameters = groupHandler.handleGroup(currentGroup);

                    if (groupParameters.attributes) {
                        attributes = [...attributes, ...groupParameters.attributes];
                    }

                    if (groupParameters.includes) {
                        includes = [...includes, ...groupParameters.includes]
                    }

                    group = [...group, ...groupParameters.group];
                }
            });
            order = [["count", "DESC"]]

            if (req) {
                order = req.query.sort ? [req.query.sort] : order;
            }
        }
        else {

            includes = [
                { as: "assignee", model: User, attributes: ["displayName", "username"] },
                { as: "reporter", model: User, attributes: ["displayName", "username"] },
                { as: "milestone", model: OrganizationMilestone, attributes: ["title"] },
                { as: "source", model: DocSource, attributes: ["repo", "organization"], where: (req && req.query && req.query.repo) && { repo: req.query.repo } },
                { as: "labels", separate: true, model: DocLabel, attributes: ["labelId"] }
            ];

            if (req && req.user) {
                includes.push({ required: false, as: "lastView", model: DocUserView, attributes: ["updatedAt"], where: { userId: req.user.id } })
            }
            after = afterGet
            limit = 30;
            order = [["updatedAt", "DESC"]]
            if (req) {
                order = req.query.sort ? [req.query.sort] : order;
            }
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
                attributes: attributes.length > 0 ? attributes : undefined,
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

    router.post(`${path} /:id/assignee`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username: string = req.body.username;
            const user: User | null = await getUserFromGithubAlias(username);
            if (user) {
                await Doc.update({
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

    router.post(`${path} /:id/watch`, async (req: Request, res: Response, next: NextFunction) => {
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

    router.post(`${path} /:id/unwatch`, async (req: Request, res: Response, next: NextFunction) => {
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
