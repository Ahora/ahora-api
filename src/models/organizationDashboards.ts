import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import User from './users';

export enum DashboardLayout {
    OneColumn = "OneColumn",
    TwoColumn = "TwoColumn"
}

export enum DashboardType {
    Public = 0,
    Private = 1
}

class OrganizationDashboard extends Model {
    public id!: number;
    public organizationId!: number;
    public teamId!: number | null;
    public userId!: number;
    public title!: string;
    public gadgets!: any;
    public description!: string | null;
    public dashboardType!: DashboardType;
    public layout!: DashboardLayout;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationDashboard.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    dashboardType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: DashboardType.Public
    },
    layout: {
        type: DataTypes.ENUM(DashboardLayout.OneColumn, DashboardLayout.TwoColumn),
        defaultValue: DashboardLayout.OneColumn
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: true,
    },
    gadgets: {
        type: DataTypes.JSON,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizationdashboards",
});

export const initAssociationOrganizationDashboard = () => {
    OrganizationDashboard.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    OrganizationDashboard.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE', as: "user" });
}

export default OrganizationDashboard;
