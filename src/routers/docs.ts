import { Request, Response, NextFunction } from "express";
import Doc from "../models/docs";
import routeCreate from "./base";
import { literal, fn } from "sequelize";
import Organization from "../models/organization";
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
import DocTeamGroupHandler from "../helpers/groups/docs/DocTeamGroupHandler";
import OrganizationTeam from "../models/organizationTeams";
import OrganizationTeamUser from "../models/organizationTeamsUsers";
import moment from "moment";
import { markdownToHTML, handleMentions, extractMentionsFromMarkdown } from "../helpers/markdown";
import { updateMentions } from "../helpers/mention";
import { updateLastView } from "../helpers/docs/db";
import DocWatcher, { DocWatcherType } from "../models/docWatcher";

const afterPost = async (doc: Doc, req: Request): Promise<Doc> => {
    await updateLabels(doc, req);
    return doc;
}

const afterPut = async (doc: Doc, req: Request): Promise<Doc> => {
    await updateLabels(doc, req);

    let watchers: number[] = [];

    if (req.user) {
        await updateLastView(doc.id, req.user.id)
        watchers.push(req.user.id);
    }

    for (let index = 0; index < watchers.length; index++) {
        await addUserToWatchersList(doc.id, watchers[index]);
    }


    return doc;
}
const updateLabels = async (doc: Doc, req: Request): Promise<void> => {
    //Update labels!
    const labelIds: number[] | undefined = req.body.labels;
    if (labelIds) {
        const itemsToAdd: any[] = labelIds.map((id: number) => {
            return {
                docId: doc.id,
                labelId: id
            }
        });

        await DocLabel.destroy({
            where: { docId: doc.id }
        });
        await DocLabel.bulkCreate(itemsToAdd);
    }
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
        reporterUserId: doc.reporterUserId,
        assigneeUserId: doc.assigneeUserId,
        docTypeId: doc.docTypeId,
        metadata: doc.metadata,
        source: newSource,
        milestone: doc.milestone,
        organizationId: doc.organizationId,
        statusId: doc.statusId,
        milestoneId: doc.milestoneId,
        updatedAt: doc.updatedAt,
        closedAt: doc.closedAt,
        commentsNumber: doc.commentsNumber,
        views: doc.views,
        createdAt: doc.createdAt,
        lastView: (doc.lastView && doc.lastView.length) > 0 ? doc.lastView[0] : null,
        watchers: doc.watchers && doc.watchers.map((watcher: any) => watcher.userId),
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

const beforePut = async (doc: Doc, req: Request): Promise<Doc> => {
    doc.updatedAt = new Date();

    return doc;
}

const beforePost = async (doc: Doc, req: Request): Promise<Doc> => {
    if (req && req.org) {
        doc.statusId = doc.statusId || req.org.defaultStatus;
        doc.organizationId = req.org.id;
    }

    if (req.user) {
        doc.assigneeUserId = req.user.id;
        doc.reporterUserId = req.user.id;
    }

    doc.createdAt = new Date();
    doc.updatedAt = new Date();

    return doc;
};

const generateQuery = async (req: Request): Promise<any> => {

    const currentOrg: Organization = req.org!;
    const query: any = { organizationId: currentOrg.id };

    if (req.user) {
        const docWatchersQuery = `SELECT "docId" FROM docwatchers as "docwatchers" WHERE "watcherType"=${DocWatcherType.Watcher} and "userId"=${req.user.id} `;
        query[Op.or] = {
            isPrivate: false,
            [Op.and]: { isPrivate: true, id: { [Op.in]: [literal(docWatchersQuery)] } }
        }
    }

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

    if (Array.isArray(req.query.status)) {
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

    if (Array.isArray(req.query.label)) {
        const labelIds: number[] = [];
        req.query.label.forEach((labelName: string) => {
            const value: Label | undefined = labelMap.get(labelName.toLowerCase());
            if (value) {
                labelIds.push(value.id);
            }
        });

        if (labelIds.length > 0) {
            const labelsQuery = `SELECT "docId" FROM doclabels as "docquery" WHERE "labelId" in (${labelIds.join(",")}) GROUP BY "docId" HAVING COUNT(*) = ${labelIds.length} `;
            query.id = [{ [Op.in]: [literal(labelsQuery)] }]
        }
    }

    //--------------team-------------------------------------------------
    if (req.query.team || req.query.team === null) {
        req.query.team = [req.query.team];
    }

    if (Array.isArray(req.query.team)) {

        const nullIndex: number = (req.query.team).indexOf(null);
        const teams: OrganizationTeam[] = await OrganizationTeam.findAll({ where: { organizationId: currentOrg.id, name: req.query.team } });
        const teamIds: (number | string)[] = teams.map((team) => team.id);

        if (nullIndex > -1) {
            teamIds.push("null");
        }

        if (teamIds.length > 0 && nullIndex === -1) {
            const labelsQuery = `SELECT "userId" FROM ${OrganizationTeamUser.tableName} WHERE "teamId" in (${teamIds.join(",")})`;
            query.reporterUserId = { [Op.in]: [literal(labelsQuery)] }
        }
        else if (teamIds.length === 1 && nullIndex > -1) {
            const labelsQuery = `SELECT "userId" FROM ${OrganizationTeamUser.tableName} WHERE "organizationId"=${currentOrg.id} and "teamId" is not null`;
            query.reporterUserId = { [Op.notIn]: [literal(labelsQuery)] }
        }
    }

    //--------------Relevant To-------------------------------------------------

    if (req.query.mention) {
        if (typeof (req.query.mention) === "string") {
            req.query.mention = [req.query.mention];
        }
    }

    if (req.query.mention) {
        req.query.mention = req.query.mention.map((username: string) => {
            switch (username) {
                case "me":
                    if (req.user) {
                        return req.user.username;
                    } else {
                        return undefined
                    }
                default:
                    return username;
            }
        });

        const usersWithoutNull: string[] = req.query.mention.filter((username: string) => username !== null);

        const users: User[] = await User.findAll({
            where: { username: usersWithoutNull },
            attributes: ["id"]
        });

        const userIds = users.map((user: any) => user.id);
        if (usersWithoutNull.length !== req.query.mention.length) {
            userIds.push(null);
        }
        if (userIds.length > 0) {
            const userIdsString = userIds.join(",");

            const mentionsQuery = `SELECT DISTINCT "docId" FROM mentions WHERE "userId" in (${userIdsString})`;
            const watchersQuery = `SELECT DISTINCT "docId" FROM docwatchers WHERE "userId" in (${userIdsString})`;
            query[Op.and] = {
                [Op.or]: [
                    { id: { [Op.in]: [literal(mentionsQuery)] } },
                    { id: { [Op.in]: [literal(watchersQuery)] } }
                ]
            };
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
    //--------------Dates---------------------------------------------------
    if (req.query.createdAt) {
        if (!Array.isArray(req.query.createdAt)) {
            const possibleNumber = parseInt(req.query.createdAt);
            if (possibleNumber < 0) {
                query.createdAt = {
                    [Op.gt]: moment().subtract(possibleNumber * -1, 'd').startOf('day').toDate()
                };
            }
            else {
                const createdAtDate = new Date(parseInt(req.query.createdAt));
                const plusday = new Date(parseInt(req.query.createdAt));
                plusday.setDate(plusday.getDate() + 1);

                query.createdAt = {
                    [Op.lte]: plusday,
                    [Op.gte]: createdAtDate
                };
            }

        }
    }
    if (req.query.closedAt) {
        if (!Array.isArray(req.query.closedAt)) {
            const possibleNumber = parseInt(req.query.closedAt);
            if (possibleNumber < 0) {
                query.closedAt = {
                    [Op.gt]: moment().subtract(possibleNumber * -1, 'd').startOf('day').toDate()
                };
            }
            else {
                const createdAtDate = new Date(parseInt(req.query.closedAt));
                const plusday = new Date(parseInt(req.query.closedAt));
                plusday.setDate(plusday.getDate() + 1);

                query.closedAt = {
                    [Op.lte]: plusday,
                    [Op.gte]: createdAtDate
                };
            }

        }
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

    if (req.query.unread) {
        if (req.user) {
            const unreadQuery = `select "docId" from docsuserview where "docsuserview"."updatedAt">"Doc"."updatedAt" and "userId"=${req.user.id}`;
            // for supporting labels 
            if (Array.isArray(query.id)) {
                query.id.push({ [Op.in]: [literal(unreadQuery)] });

            }
            else {
                query.id = { [Op.notIn]: [literal(unreadQuery)] }
            }
        }
        else {
            query.id = -1
        }

    }

    return query;
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
groupByManager.registerGroup("closedAt", new DateGroupHandler("closedAt"));
groupByManager.registerGroup("updatedAt", new DateGroupHandler("updatedAt"));
groupByManager.registerGroup("team", new DocTeamGroupHandler());


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

            switch (req.query.scalar) {
                case "timetoclose":
                    attributes = [[fn('AVG', fn("EXTRACT", fn("EPOCH FROM", literal('"Doc"."closedAt"-"Doc"."createdAt"')))), 'count']];
                    break;
                default:
                    attributes = [[fn('COUNT', '*'), 'count']];
            }

            raw = true;
            req.query.group.forEach((currentGroup: string) => {

                const groupHandler: IGroupHandler | undefined = groupByManager.getGroup(currentGroup);
                if (groupHandler) {
                    const groupParameters: IGroupParameters = groupHandler.handleGroup(currentGroup, req);

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
                order = req.query.sort ? [literal(`"${req.query.sort}"`)] : order;
            }
        }
        else {

            includes = [
                { as: "milestone", model: OrganizationMilestone, attributes: ["title"] },
                { as: "source", model: DocSource, attributes: ["repo", "organization"], where: (req && req.query && req.query.repo) && { repo: req.query.repo } },
                { as: "watchers", model: DocWatcher, separate: true, attributes: ["id", "userId"] },
                { as: "labels", separate: true, model: DocLabel, attributes: ["labelId"] }
            ];

            if (req && req.user) {
                includes.push({ required: false, as: "lastView", model: DocUserView, attributes: ["updatedAt"], where: { userId: req.user.id } })
            }
            after = afterGet
            limit = (req && req.query) ? parseInt(req.query.limit) : 30;
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
                after: afterGet,
                useOnlyAdditionalParams: true,
                include: includes
            },
            post: { before: beforePost, after: afterGet, afterCreateOrUpdate: afterPost, include: includes },
            put: { before: beforePut, after: afterGet, afterCreateOrUpdate: afterPut, include: includes }
        }
    });

    router.use(`${path}/:id`, async (req: Request, res: Response, next: NextFunction) => {
        const currentDoc: Doc | null = await Doc.findByPk(req.params.id);
        if (currentDoc) {
            req.doc = currentDoc;

            if (currentDoc.docSourceId) {
                const currentDocSource: DocSource | null = await DocSource.findByPk(currentDoc.docSourceId);
                if (currentDocSource) {
                    req.docSource = currentDocSource;
                }
            }
            next();
        }
        else {
            res.status(404).send();
        }
    })

    router.post(`${path}/:id/assignee`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const username: string = req.body.username;
            const docId = parseInt(req.params.id);
            const user: User | null = await getUserFromGithubAlias(username);
            if (user) {
                await Doc.update({
                    assigneeUserId: user.id,
                    updatedAt: new Date()
                }, { where: { id: req.params.id } });
                await addUserToWatchersList(docId, user.id);

                if (req.user) {
                    await updateLastView(docId, req.user.id)
                }
                res.send(user);
            } else {
                res.status(400).send();
            }
        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/status`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const statusId: number = req.body.statusId;
            const status: OrganizationStatus | null = await OrganizationStatus.findByPk(statusId);
            const docId = parseInt(req.params.id);

            if (status) {
                const updateParams: any = { statusId: status.id, updatedByUserId: req.user && req.user.id }
                if (status.updateCloseTime) {
                    updateParams.closedAt = new Date();
                }
                else {
                    updateParams.closedAt = null;
                }
                updateParams.updatedAt = new Date();
                await Doc.update(updateParams, { individualHooks: true, where: { id: docId } });

                if (req.user) {
                    await updateLastView(docId, req.user.id)
                    await addUserToWatchersList(docId, req.user.id);
                }
                res.send();
            }
            else {
                next()
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

    const bytes = [
        71, 73, 70, 56, 57, 97, 1, 0, 1, 0,
        128, 0, 0, 0, 0, 0, 0, 0, 0, 33,
        249, 4, 1, 0, 0, 0, 0, 44, 0, 0,
        0, 0, 1, 0, 1, 0, 0, 2, 2, 68,
        1, 0, 59];
    var emptyPixel = Buffer.from(bytes);

    router.get(`${path}/:id/view`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const promises: Promise<any>[] = [];
            if (req.user && req.doc) {

                var promiseUpSert = updateLastView(req.doc.id, req.user.id);
                promises.push(promiseUpSert);

            }

            if (req.doc) {
                var PromiseIncrement = req.doc.increment({ 'views': 1 });
                promises.push(PromiseIncrement);
            }

            if (promises.length > 0) {
                await Promise.all(promises);
            }
            res.status(200).contentType('image/gif').send(emptyPixel);
        } catch (error) {
            next(error);
        }
    });
    return router;
};
