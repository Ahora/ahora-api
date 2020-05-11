import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export enum DashboardLayout {
    OneColumn = "OneColumn",
    TwoColumn = "TwoColumn"
}

export enum DashboardType {
    Public = 0,
    Private = 1
}

export interface IDashboardAttributes {
    id?: number;
    organizationId: number;
    teamId: number;
    userId: number;
    title?: string;
    description?: string;
    dashboardType: DashboardType
    layout: DashboardLayout;
}

export interface IDashboardInstance extends Sequelize.Instance<IDashboardAttributes>, IDashboardAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DashboardsFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDashboardInstance, IDashboardAttributes> => {
        let attributes: SequelizeAttributes<IDashboardAttributes> = {
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
        };

        return sequelize.define<IDashboardInstance, IDashboardAttributes>("organizationdashboards", attributes, {
            timestamps: true
        });
    };