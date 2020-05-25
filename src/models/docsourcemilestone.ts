import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";
import { MilestoneStatus } from "./milestones";

export interface IDocSourceMilestoneAttributes {
    id?: number;
    docSourceId: number;
    milestoneId: number;
    sourceId: number;
    title: string;
    description: string;
    closedAt?: Date;
    dueOn?: Date;
    state: MilestoneStatus;
}

export interface IDocSourceMilestoneInstance extends Sequelize.Instance<IDocSourceMilestoneAttributes>, IDocSourceMilestoneAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocSourceMilestoneFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocSourceMilestoneInstance, IDocSourceMilestoneAttributes> => {
        let attributes: SequelizeAttributes<IDocSourceMilestoneAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            docSourceId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            milestoneId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sourceId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            title: {
                type: DataTypes.STRING,
                allowNull: false
            },
            dueOn: {
                type: DataTypes.DATE,
                allowNull: true
            },
            closedAt: {
                type: DataTypes.DATE,
                allowNull: true
            },
            state: {
                type: DataTypes.ENUM(MilestoneStatus.open, MilestoneStatus.closed),
                allowNull: false,
                defaultValue: MilestoneStatus.open
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        };

        return sequelize.define<IDocSourceMilestoneInstance, IDocSourceMilestoneAttributes>("docsourcemilestones", attributes, {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    name: 'unique_milestones_docSourceId_sourceId',
                    fields: ["docSourceId", "sourceId"]
                }
            ]
        });
    };