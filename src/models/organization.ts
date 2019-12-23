import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export enum OrganizationType {
    Public=0,
    Private = 1
}

export interface IOrganizationAttributes {
    id?: number;
    login: string;
    displayName: string;
    node_id?: string;
    description?: string;
    defaultStatus?: number;
    orgType: OrganizationType
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
            allowNull: false
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: false
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
        },
        orgType: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: OrganizationType.Public
        }
    };

    return sequelize.define<IOrganizationInstance, IOrganizationAttributes>("organizations", attributes, {
        timestamps: true,
        indexes: [
            { 
              unique: true,   
              name: 'login',  
              fields: [sequelize.fn('lower', sequelize.col('login'))]   
            }
          ]
    });
  };