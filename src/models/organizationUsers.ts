import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IOrganizationUserAttribute {
    id?: number;
    userId: number;
    permission: number;
    organizationId: number;
}

export interface IOrganizationUserInstance extends Sequelize.Instance<IOrganizationUserAttribute>, IOrganizationUserAttribute {
    id: number;
    user: {
        username: string;
        displayName?: string;
    }
}

// tslint:disable-next-line:typedef
export const OrganizationPermissionFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<IOrganizationUserInstance, IOrganizationUserAttribute> => {
    let attributes:SequelizeAttributes<IOrganizationUserAttribute> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        permission: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 1
        },
        organizationId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };

    return sequelize.define<IOrganizationUserInstance, IOrganizationUserAttribute>("organizationusers", attributes, {

        timestamps: true
    });
  };