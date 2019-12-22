import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocAttributes {
    id: number;
    subject: string;
    description?: string;
    htmlDescription?: string;
    docType: string;
    userAlias: string;
    metadata: any;
    organizationId: number;
    status?: number;
}

export interface IDocInstance extends Sequelize.Instance<IDocAttributes>, IDocAttributes {
}

// tslint:disable-next-line:typedef
export const EventsFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<IDocInstance, IDocAttributes> => {
    let attributes:SequelizeAttributes<IDocAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false
        },
        docType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        },
        status: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        htmlDescription: {
            type: DataTypes.TEXT,
            allowNull: true
        },
        userAlias: {
            type: DataTypes.STRING
        },
        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };

    return sequelize.define<IDocInstance, IDocAttributes>("docs", attributes, {
        timestamps: true
    });
  };