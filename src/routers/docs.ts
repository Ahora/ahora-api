import { Request, Response, NextFunction } from "express";
import Doc from "../models/docs";
import routeCreate from "./base";
import { literal, fn, Sequelize } from "sequelize";
import Organization from "../models/organization";
import User from "../models/users";
import DocLabel from "../models/docLabel";
import Label from "../models/labels";
import { getUserFromId } from "../helpers/users";
import { addUsersToWatcherList, addUserToWatchersList, deleteUserFromWatchers, unWatch } from "../helpers/docWatchers";
import GroupByManager from "../helpers/groups/GroupByManager";
import DocRepoterGroupHandler from "../helpers/groups/groups/DocRepoterGroupHandler";
import DocAssigneeGroupHandler from "../helpers/groups/groups/DocAssigneeGroupHandler";
import DocStatusGroupHandler from "../helpers/groups/groups/DocStatusGroupHandler";
import DocLabelGroupHandler from "../helpers/groups/groups/DocLabelGroupHandler";
import DocDocTypeGroupHandler from "../helpers/groups/groups/DocDocTypeGroupHandler";
import { IGroupHandler, IGroupParameters, GroupInfo } from "../helpers/groups/IGroupHandler";
import DocRepoGroupHandler from "../helpers/groups/groups/DocRepoGroupHandler";
import DateGroupHandler from "../helpers/groups/groups/DateGroupHandler";
import { Op } from "sequelize";
import DocMilestoneGroupHandler from "../helpers/groups/groups/DocMilestoneGroupHandler";
import OrganizationStatus from "../models/docStatuses";
import DocType from "../models/docType";
import OrganizationMilestone from "../models/milestones";
import DocSource from "../models/docSource";
import DocUserView from "../models/docUserView";
import DocTeamGroupHandler from "../helpers/groups/groups/DocTeamGroupHandler";
import OrganizationTeam from "../models/organizationTeams";
import OrganizationTeamUser from "../models/organizationTeamsUsers";
import moment from "moment";
import { updateLastView } from "../helpers/docs/db";
import DocWatcher, { DocWatcherType } from "../models/docWatcher";
import Comment from "../models/comments";
import { addAssigneeComment, addIsPrivateComment, addLabelAddedComment, addStatusComment } from "../helpers/comments";
import { reportCommentToWS, reportDocToWS } from "../helpers/websockets/webSocketHelper";
import ConditionManager from "../helpers/groups/ConditionManager";
import UserGroupMentionCondition from "../helpers/groups/docs/conditions/UserGroupCondition";
import StatusCondition from "../helpers/groups/docs/conditions/StatusCondition";
import DocTypeCondition from "../helpers/groups/docs/conditions/DocTypeCondition";
import MilestoneCondition from "../helpers/groups/docs/conditions/MilestoneCondition";
import IsPrivateCondition from "../helpers/groups/docs/conditions/IsPrivateCondition";
import LabelCondition from "../helpers/groups/docs/conditions/LabelCondition";

const afterPost = async (doc: Doc, req: Request): Promise<Doc> => {
    await updateLabels(doc, req);

    if (Array.isArray(req.body.users)) {
        await addUsersToWatcherList(doc.id, req.body.users.filter((userId: number) => userId !== req.user?.id))
    }
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
        isPrivate: doc.isPrivate,
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

const conditionManager = new ConditionManager();
conditionManager.registerField("reporter", new UserGroupMentionCondition("reporterUserId"));
conditionManager.registerField("assignee", new UserGroupMentionCondition("assigneeUserId"));
conditionManager.registerField("status", new StatusCondition());
conditionManager.registerField("milestone", new MilestoneCondition());
conditionManager.registerField("private", new IsPrivateCondition());
conditionManager.registerField("docType", new DocTypeCondition());
conditionManager.registerField("label", new LabelCondition());

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
    else {
        query[Op.or] = { isPrivate: false };
    }

    for (const key in req.query) {
        const condition = conditionManager.getField(key);
        if (condition) {
            if (typeof (req.query[key]) === "string") {
                req.query[key] = [req.query[key]];
            }
            const values = req.query[key];
            const sqlCondition = await condition.generate(values, req.org!, req.user);
            query[condition.getFieldName()] = sqlCondition;
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

    if (req.query.updatedAt) {
        if (Array.isArray(req.query.updatedAt)) {
            const updatedAtDate = new Date(parseInt(req.query.updatedAt));
            const plusday = new Date(parseInt(req.query.updatedAt));
            plusday.setDate(plusday.getDate() + 1);

            query.updatedAt = {
                [Op.lte]: plusday,
                [Op.gte]: updatedAtDate
            };
        }
        else {
            query.updatedAt = {
                [Op.gt]: req.query.updatedAt
            };
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

    if (req.query.docId) {
        query.docId = req.query.docId;
    }

    if (req.query.unread) {
        if (req.user) {
            const unreadQuery = `select "docId" from docsuserview where "docsuserview"."updatedAt">"Doc"."updatedAt" and "userId"=${req.user.id}`;
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
            post: { before: beforePost, after: afterGet, afterCreateOrUpdate: afterPost, include: includes, webhook: (doc: Doc, req, socketId) => { reportDocToWS(req.org!.login, doc, "post", socketId) } },
            put: { before: beforePut, after: afterGet, afterCreateOrUpdate: afterPut, include: includes, webhook: (doc: Doc, req, socketId) => { reportDocToWS(req.org!.login, doc, "put", socketId) } },
            delete: { webhook: (doc: Doc, req, socketId) => { reportDocToWS(req.org!.login, doc, "delete", socketId) } }
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
            const toUserId: number | null = req.body.userId;
            const docId = parseInt(req.params.id);
            let user: User | null = null;
            if (toUserId) {
                user = await getUserFromId(toUserId);
            }
            let prevAssignee: User | null = null;
            if (req.doc && req.doc.assigneeUserId) {
                prevAssignee = await getUserFromId(req.doc.assigneeUserId);
            }

            const [recordsUpdated, updatedDocs] = await Doc.update({
                assigneeUserId: toUserId,
                updatedAt: new Date()
            }, { where: { id: req.params.id } });

            if (toUserId) {
                await addUserToWatchersList(docId, toUserId);
            }
            if (req.user) {
                await updateLastView(docId, req.user.id);
                const comment = await addAssigneeComment(docId, prevAssignee, user, req.user);
                await reportCommentToWS(req.org!.login, req.doc!.isPrivate, comment, "docupdate");
            }

            if (updatedDocs && updatedDocs.length > 0)
                reportDocToWS(req.org!.login, updatedDocs[0], "put");
            res.send(user);

        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/labels`, async (req: Request, res: Response) => {
        const docId = parseInt(req.params.id);
        await DocLabel.create({
            docId,
            labelId: req.body.labelId
        });
    });

    router.delete(`${path}/:id/labels/:labelId`, async (req: Request, res: Response) => {
        const docId = parseInt(req.params.id);
        const labelId = parseInt(req.params.labelId);

        await DocLabel.destroy({
            where: {
                docId,
                labelId
            }
        });
        res.send();
    });

    router.post(`${path}/:id/status`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const statusId: number = req.body.statusId;
            const status: OrganizationStatus | null = await OrganizationStatus.findByPk(statusId);
            let prevStatus: OrganizationStatus | null = null;
            if (req.doc?.statusId) {
                prevStatus = await OrganizationStatus.findByPk(req.doc!.statusId);
            }
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
                const [recordsUpdated, updatedDocs] = await Doc.update(updateParams, { individualHooks: true, where: { id: docId } });

                if (req.user) {
                    await updateLastView(docId, req.user.id)
                    await addUserToWatchersList(docId, req.user.id);
                    const comment = await addStatusComment(docId, prevStatus, status, req.user);
                    await reportCommentToWS(req.org!.login, req.doc!.isPrivate, comment, "docupdate");

                }
                if (updatedDocs.length > 0)
                    reportDocToWS(req.org!.login, updatedDocs[0], "put");
                res.send();
            }
            else {
                next()
            }
        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/isprivate`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const isPrivate: boolean = req.body.isPrivate;
            const docId = parseInt(req.params.id);

            const updateParams: any = { isPrivate, updatedAt: new Date() }
            const [recordsUpdated, updatedDocs] = await Doc.update(updateParams, { individualHooks: true, where: { id: docId } });

            if (req.user) {
                await updateLastView(docId, req.user.id)
                await addUserToWatchersList(docId, req.user.id);
                const comment = await addIsPrivateComment(docId, isPrivate, req.user);
                await reportCommentToWS(req.org!.login, isPrivate, comment, "docupdate");
            }

            if (updatedDocs.length > 0)
                reportDocToWS(req.org!.login, updatedDocs[0], "put");
            res.send();
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

    router.post(`${path}/:id/watchers/`, async (req: Request, res: Response, next: NextFunction) => {
        try {

            const watcher = await addUserToWatchersList(parseInt(req.params.id), req.body.userId);
            res.send(watcher);

        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/watchers/:userId`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const watcher = await addUserToWatchersList(parseInt(req.params.id), req.body.userId);
            res.send(watcher);

        } catch (error) {
            next(error);
        }
    });

    router.delete(`${path}/:id/watchers/:userId`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            await deleteUserFromWatchers(parseInt(req.params.id), parseInt(req.params.userId));
            res.send();

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
            res.send();
        } catch (error) {
            next(error);
        }
    });


    router.get(`${path}unread`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const tolat = literal(`"lastView"."updatedAt"`);
            const query = await generateQuery(req);
            const results: any[] = await Doc.findAll({
                attributes: [[fn('COUNT', 'comments.id'), 'count'], "Doc.id"],
                raw: true,
                group: ["Doc.id"],
                where: query,
                include: [
                    { required: false, as: "lastView", model: DocUserView, attributes: [], where: { userId: req.user!.id } },
                    {
                        attributes: [],
                        model: Comment,
                        where: {
                            [Op.or]: [
                                {
                                    createdAt: {
                                        [Op.gt]: literal(`"lastView"."updatedAt"`)
                                    }
                                },
                                literal('"lastView"."updatedAt" is null')
                            ]
                        },
                        as: "comments",
                        required: false
                    }
                ]
            });

            const keyvalue: any = {};
            results.forEach((item) => {
                keyvalue[item["id"]] = parseInt(item.count);
            })
            res.send(keyvalue);
        } catch (error) {
            next(error);
        }
    });
    return router;
};
