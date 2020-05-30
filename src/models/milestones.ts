import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';

export enum MilestoneStatus {
    open = "open",
    closed = "closed"
}

class OrganizationMilestone extends Model {
    public id!: number;
    public title!: string;
    public description!: string | null;
    public organizationId!: number;
    public closedAt!: Date | null;
    public dueOn?: Date | null;
    public state!: MilestoneStatus;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationMilestone.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organizationId: {
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
        type: DataTypes.ENUM(MilestoneStatus.open, MilestoneStatus.closed),
        allowNull: false,
        defaultValue: MilestoneStatus.open
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizationmilestones",
});

export const initAssociationOrganizationMilestone = () => {
    OrganizationMilestone.hasMany(OrganizationMilestone, { foreignKey: "milestoneId", onDelete: 'CASCADE', as: "milestone" });
    OrganizationMilestone.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
}

export default OrganizationMilestone;