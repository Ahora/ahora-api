import db from '.';
import DocSource from './docSource';
import OrganizationMilestone, { MilestoneStatus } from "./milestones";
import { Model, DataTypes } from 'sequelize';


class DocSourceMilestone extends Model {
    public id!: number;
    public docSourceId!: number;
    public milestoneId!: number;
    public sourceId!: number;
    public organizationId!: number;
    public title!: string;
    public description!: string | null;
    public closedAt!: Date | null;
    public dueOn!: Date | null;
    public state!: MilestoneStatus;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocSourceMilestone.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    docSourceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    milestoneId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sourceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    title: {
        type: DataTypes.STRING,
        allowNull: false
    },
    dueOn: {
        type: DataTypes.DATE,
        allowNull: true
    },
    closedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    state: {
        type: DataTypes.ENUM("open", "closed"),
        allowNull: false,
        defaultValue: "open"
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "docsourcemilestones",
    indexes: [
        {
            unique: true,
            name: 'unique_milestones_docSourceId_sourceId',
            fields: ["docSourceId", "sourceId"]
        }
    ]
});

export const initAssociationDocSourceMilestone = () => {
    DocSourceMilestone.belongsTo(OrganizationMilestone, { foreignKey: "milestoneId", onDelete: 'CASCADE' });
    DocSourceMilestone.belongsTo(DocSource, { foreignKey: "docSourceId", onDelete: 'CASCADE' });
}

export default DocSourceMilestone;