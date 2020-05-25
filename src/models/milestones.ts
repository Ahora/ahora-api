import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export enum MilestoneStatus {
    open = "open",
    closed = "closed"
}


export interface IMilestoneAttributes {
    id?: number;
    title: string;
    description: string;
    organizationId: number;
    closedAt?: Date;
    dueOn?: Date;
    state: MilestoneStatus;
}

export interface IMilestoneInstance extends Sequelize.Instance<IMilestoneAttributes>, IMilestoneAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const MilestoneFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IMilestoneInstance, IMilestoneAttributes> => {
        let attributes: SequelizeAttributes<IMilestoneAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            organizationId: {
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

        return sequelize.define<IMilestoneInstance, IMilestoneAttributes>("organizationmilestones", attributes, {
            timestamps: true
        });
    };