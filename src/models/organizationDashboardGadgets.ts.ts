import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDashboardGadgetAttributes {
    id?: number;
    dashboardId: number;
    title: string;
    gadgetType: string;
    metadata?: any;
    location?: number;
    nextGadgetId?: number;
    userId: number;
    createdAt: Date;
    updatedAt: Date;
}

export interface IDashboardGadgetInstance extends Sequelize.Instance<IDashboardGadgetAttributes>, IDashboardGadgetAttributes {
    id: number;
    user: {
        username: string;
        displayName?: string;
    }
}

// tslint:disable-next-line:typedef
export const DashboardGadgetsFactory = (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
    Sequelize.Model<IDashboardGadgetInstance, IDashboardGadgetAttributes> => {
    let attributes: SequelizeAttributes<IDashboardGadgetAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        dashboardId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        gadgetType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        title: {
            type: DataTypes.STRING,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        },
        location: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        nextGadgetId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }

    };

    return sequelize.define<IDashboardGadgetInstance, IDashboardGadgetAttributes>("dashboardGadgets", attributes, {
        timestamps: false
    });
};