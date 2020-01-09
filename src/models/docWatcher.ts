import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export enum DocWatcherType {
    Watcher = 0,
    NonWatcher = 1
}

export interface IDocWatcherAttributes {
    id?: number;
    docId: number;
    watcherType: DocWatcherType;
    userId: number;
}

export interface IDocWatcherInstance extends Sequelize.Instance<IDocWatcherAttributes>, IDocWatcherAttributes {
    id: number;
    user: {
        username: string;
        displayName?: string;
    }
}

// tslint:disable-next-line:typedef
export const DocWatchersFactory = (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
    Sequelize.Model<IDocWatcherInstance, IDocWatcherAttributes> => {
    let attributes: SequelizeAttributes<IDocWatcherAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        docId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        watcherType: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: DocWatcherType.Watcher
        }
    };

    return sequelize.define<IDocWatcherInstance, IDocWatcherAttributes>("docwatchers", attributes, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                name: 'docidanduserid',
                fields: ["docId", "userId"]
            }
        ]
    });
};