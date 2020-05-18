import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocStatusAttributes {
    id?: number;
    name: string;
    color?: string;
    description?: string;
    organizationId?: number;
}

export interface IDocStatusInstance extends Sequelize.Instance<IDocStatusAttributes>, IDocStatusAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const StatusesFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocStatusInstance, IDocStatusAttributes> => {
        let attributes: SequelizeAttributes<IDocStatusAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            color: {
                type: DataTypes.STRING,
                allowNull: true
            },
            organizationId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        };

        return sequelize.define<IDocStatusInstance, IDocStatusAttributes>("DocStatuses", attributes, {
            timestamps: true
        });
    };