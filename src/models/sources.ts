import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export enum SourceType {
    GitHub = "github",
    Jira = "jira",
    Internal = "internal"
}

export interface ISourceAttributes {
    id?: number;
    sourceType?: SourceType;
    url?: string;
    organizationId?: number;
}

export interface ISourceInstance extends Sequelize.Instance<ISourceAttributes>, ISourceAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const SourcesFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<ISourceInstance, ISourceAttributes> => {
        let attributes: SequelizeAttributes<ISourceAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            url: {
                type: DataTypes.STRING,
                allowNull: true
            },
            organizationId: {
                type: DataTypes.INTEGER,
                allowNull: true
            },
            sourceType: {
                type: DataTypes.ENUM("internal", "github", "jira"),
                allowNull: false,
                defaultValue: SourceType.Internal
            }
        };

        return sequelize.define<ISourceInstance, ISourceAttributes>("sources", attributes, {
            timestamps: true
        });
    };