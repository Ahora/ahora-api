import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IUserAttributes {
    id?: number;
    displayName?: string;
    username: string;
    gitHubId?: string;
    email?: string;
    accessToken?: string;
    refreshToken?: string;
}

export interface IUserInstance extends Sequelize.Instance<IUserAttributes>, IUserAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const UsersFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<IUserInstance, IUserAttributes> => {
    let attributes:SequelizeAttributes<IUserAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        displayName: {
            type: DataTypes.STRING,
            allowNull: true
        }, 
        gitHubId: {
            type: DataTypes.STRING,
            allowNull: true
        },
        username: {
            type: DataTypes.STRING,
            allowNull: true
        }, 
        accessToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        refreshToken: {
            type: DataTypes.STRING,
            allowNull: true
        },
        email: {
            type: DataTypes.STRING,
            allowNull: true
        },
    };

    return sequelize.define<IUserInstance, IUserAttributes>("users", attributes, {
        timestamps: true
    });
  };