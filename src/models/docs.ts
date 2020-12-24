
import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import OrganizationStatus from './docStatuses';
import User from './users';
import DocType from './docType';
import DocWatcher from './docWatcher';
import DocUserView from './docUserView';
import DocLabel from './docLabel';
import Comment from './comments';
import DocSource from './docSource';
import OrganizationMilestone from './milestones';
import { SourceableModel } from '../routers/sync/BaseSync';
import { markdownToHTML, extractMentionsFromMarkdown, handleMentions } from '../helpers/markdown';
import { updateMentions } from '../helpers/mention';
import { addUserToWatchersList } from '../helpers/docWatchers';
import { updateLastView } from '../helpers/docs/db';

class Doc extends SourceableModel {
    public id!: number;
    public subject!: string;
    public description!: string | null;
    public htmlDescription!: string | null;
    public updatedByUserId!: number | null;
    public assigneeUserId!: number | null;
    public reporterUserId!: number | null;
    public docTypeId!: number;
    public metadata!: any | null;
    public commentsNumber!: number;
    public views!: number;
    public milestoneId!: number | null;
    public organizationId!: number;
    public statusId!: number | null;
    public isPrivate!: boolean | null;
    public closedAt!: Date[] | null;

    // timestamps!
    public createdAt!: Date;
    public updatedAt!: Date;
}

Doc.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    sourceId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    subject: {
        type: DataTypes.STRING,
        allowNull: false
    },
    docTypeId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    metadata: {
        type: DataTypes.JSON,
        allowNull: true
    },
    statusId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    htmlDescription: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    docSourceId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    assigneeUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    reporterUserId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    milestoneId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    updatedByUserId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    commentsNumber: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    views: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    isPrivate: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: db.sequelize,
    timestamps: false,
    tableName: "docs",
});

Doc.beforeSave(async (instance) => {
    if (instance.description) {
        const result = await handleMentions(instance.description);
        instance.htmlDescription = await markdownToHTML(result.markdown);

    }
});

Doc.afterCreate(async (instance) => {
    if (instance.reporterUserId) {
        await Promise.all([
            addUserToWatchersList(instance.id, instance.reporterUserId),
            updateLastView(instance.id, instance.reporterUserId)
        ]);
    }
});

Doc.afterUpdate(async (instance) => {
    if (instance.updatedByUserId) {
        await Promise.all([
            addUserToWatchersList(instance.id, instance.updatedByUserId),
            updateLastView(instance.id, instance.updatedByUserId)
        ]);
    }
});

Doc.afterSave(async (instance) => {
    let watchers: number[] = [];
    if (instance.description) {
        const mentionUsers = await extractMentionsFromMarkdown(instance.description);
        const mentionedUserIds = mentionUsers.map((user) => user.id);
        await updateMentions(mentionedUserIds, instance.id);

        watchers = [...watchers, ...mentionedUserIds];
    }

    for (let index = 0; index < watchers.length; index++) {
        await addUserToWatchersList(instance.id, watchers[index]);
    }
});

export const initAssociationDocs = () => {
    Doc.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Doc.belongsTo(OrganizationStatus, { foreignKey: "statusId", onDelete: 'CASCADE', as: "status" });
    Doc.belongsTo(DocSource, { foreignKey: "docSourceId", onDelete: 'CASCADE', as: "source" });
    Doc.belongsTo(User, { foreignKey: "assigneeUserId", onDelete: 'CASCADE', as: "assignee" });
    Doc.belongsTo(User, { foreignKey: "updatedByUserId", onDelete: 'CASCADE', as: "updatedBy" });
    Doc.belongsTo(User, { foreignKey: "reporterUserId", onDelete: 'CASCADE', as: "reporter" });
    Doc.belongsTo(DocType, { foreignKey: "docTypeId", onDelete: 'CASCADE', as: "docType" });
    Doc.belongsTo(OrganizationMilestone, { foreignKey: "milestoneId", onDelete: 'SET NULL', as: "milestone" });
    Doc.hasMany(DocWatcher, { foreignKey: "docId", onDelete: 'CASCADE', as: 'watchers' });
    Doc.hasMany(DocUserView, { foreignKey: "docId", onDelete: 'CASCADE', as: "lastView" });
    Doc.hasMany(Comment, { foreignKey: "docId", onDelete: 'CASCADE', as: "comments" });
    Doc.hasMany(DocLabel, { foreignKey: "docId", onDelete: 'CASCADE', as: "labels" });
}

export default Doc;