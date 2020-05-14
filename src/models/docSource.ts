import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocSourceAttributes {
    id?: number;
    organizationId: number;
    organization: string;
    repo: string;
    lastUpdated?: Date;
    syncing: true;
    startSyncTime?: Date;
}

export interface IDocSourceInstance extends Sequelize.Instance<IDocSourceAttributes>, IDocSourceAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocSourcesFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocSourceInstance, IDocSourceAttributes> => {
        let attributes: SequelizeAttributes<IDocSourceAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            organizationId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            organization: {
                type: DataTypes.STRING,
                allowNull: false
            },
            repo: {
                type: DataTypes.STRING,
                allowNull: false
            },
            lastUpdated: {
                type: DataTypes.DATE,
                allowNull: true
            },
            syncing: {
                type: DataTypes.BOOLEAN,
                allowNull: false
            },
            startSyncTime: {
                type: DataTypes.DATE,
                allowNull: true
            }
        };

        return sequelize.define<IDocSourceInstance, IDocSourceAttributes>("docsources", attributes, {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    name: 'docSources',
                    fields: ["organization", "repo"]
                }
            ]
        });
    };