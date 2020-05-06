import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocAttributes {
    id: number;
    docId?: number;
    subject: string;
    description?: string;
    htmlDescription?: string;
    assigneeUserId?: number;
    reporterUserId?: number;
    docTypeId: number;
    metadata: any;
    commentsNumber: number;
    views: number;
    sourceId?: number;
    organizationId: number;
    statusId?: number;
    labels?: number[];
    createdAt: Date;
    closedAt?: Date;
    updatedAt: Date;
}

export interface IDocInstance extends Sequelize.Instance<IDocAttributes>, IDocAttributes {
    assignee: {
        username: string;
        displayName?: string;
    },
    reporter: {
        username: string;
        displayName?: string;
    },
    source?: {
        organization: string;
        repo: string;
    }
    lastView: [{
        updatedAt: Date;
    }]
}

// tslint:disable-next-line:typedef
export const EventsFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocInstance, IDocAttributes> => {
        let attributes: SequelizeAttributes<IDocAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            docId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            subject: {
                type: DataTypes.STRING,
                allowNull: false
            },
            docTypeId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            metadata: {
                type: DataTypes.JSON,
                allowNull: true
            },
            statusId: {
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
            organizationId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sourceId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            assigneeUserId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            reporterUserId: {
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
            },
            closedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            commentsNumber: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            },
            views: {
                type: DataTypes.INTEGER,
                allowNull: false,
                defaultValue: 0
            }
        };

        return sequelize.define<IDocInstance, IDocAttributes>("docs", attributes, {
            timestamps: false
        });
    };