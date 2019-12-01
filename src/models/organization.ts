import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IOrganizationAttributes {
    id?: number;
    login: string;
    node_id?: string;
    description?: string;
    defaultStatus?: number;
}

export interface IOrganizationInstance extends Sequelize.Instance<IOrganizationAttributes>, IOrganizationAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const OrganizationsFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<IOrganizationInstance, IOrganizationAttributes> => {
    let attributes:SequelizeAttributes<IOrganizationAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            primaryKey: true,
            autoIncrement: true
        },
        login: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
        node_id: {
            type: DataTypes.STRING,
            allowNull: true
        },
        defaultStatus: {
            type: DataTypes.INTEGER,
            allowNull: true
        }, 
        description: {
            type: DataTypes.STRING,
            allowNull: true
        }
    };

    return sequelize.define<IOrganizationInstance, IOrganizationAttributes>("organizations", attributes, {
        timestamps: true
    });
  };