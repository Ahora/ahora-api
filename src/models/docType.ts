import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocTypeAttributes {
    id?: number;
    name: string;
    code: string;
    description?: string;
    organizationId: number;
    nextDocType?: number;
}

export interface IDocTypeInstance extends Sequelize.Instance<IDocTypeAttributes>, IDocTypeAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocTypesFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocTypeInstance, IDocTypeAttributes> => {
        let attributes: SequelizeAttributes<IDocTypeAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            code: {
                type: DataTypes.STRING,
                allowNull: false
            },
            organizationId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            nextDocType: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        };

        return sequelize.define<IDocTypeInstance, IDocTypeAttributes>("DocTypes", attributes, {
            timestamps: true
        });
    };