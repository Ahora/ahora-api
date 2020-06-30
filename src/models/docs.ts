
import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import OrganizationStatus from './docStatuses';
import User from './users';
import DocType from './docType';
import DocWatcher from './docWatcher';
import DocUserView from './docUserView';
import DocLabel from './docLabel';
import DocSource from './docSource';
import OrganizationMilestone from './milestones';

class Doc extends Model {
    public id!: number;
    public sourceId!: number | null;
    public subject!: string;
    public description!: string | null;
    public htmlDescription!: string | null;
    public assigneeUserId!: number | null;
    public reporterUserId!: number | null;
    public docTypeId!: number;
    public metadata!: any | null;
    public commentsNumber!: number;
    public views!: number;
    public docSourceId!: number | null;
    public milestoneId!: number | null;
    public organizationId!: number;
    public statusId!: number | null;
    public closedAt!: Date[] | null;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
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
    }
}, {
    sequelize: db.sequelize,
    timestamps: false,
    tableName: "docs",
});

export const initAssociationDocs = () => {
    Doc.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Doc.belongsTo(OrganizationStatus, { foreignKey: "statusId", onDelete: 'CASCADE', as: "status" });
    Doc.belongsTo(DocSource, { foreignKey: "docSourceId", onDelete: 'CASCADE', as: "source" });
    Doc.belongsTo(User, { foreignKey: "assigneeUserId", onDelete: 'CASCADE', as: "assignee" });
    Doc.belongsTo(User, { foreignKey: "reporterUserId", onDelete: 'CASCADE', as: "reporter" });
    Doc.belongsTo(DocType, { foreignKey: "docTypeId", onDelete: 'CASCADE', as: "docType" });
    Doc.belongsTo(OrganizationMilestone, { foreignKey: "milestoneId", onDelete: 'CASCADE', as: "milestone" });
    Doc.hasMany(DocWatcher, { foreignKey: "docId", onDelete: 'CASCADE' });
    Doc.hasMany(DocUserView, { foreignKey: "docId", onDelete: 'CASCADE', as: "lastView" });
    Doc.hasMany(DocLabel, { foreignKey: "docId", onDelete: 'CASCADE', as: "labels" });
}

export default Doc;