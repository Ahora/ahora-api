import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocSourceLabelAttributes {
    id?: number;
    docSourceId: number;
    labelId: number;
    sourceId: number;
    name: string;
    color: string;
    description: string;
}

export interface IDocSourceLabelInstance extends Sequelize.Instance<IDocSourceLabelAttributes>, IDocSourceLabelAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocSourceLabelFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocSourceLabelInstance, IDocSourceLabelAttributes> => {
        let attributes: SequelizeAttributes<IDocSourceLabelAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            docSourceId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            labelId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            sourceId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            color: {
                type: DataTypes.STRING,
                allowNull: true
            },
            description: {
                type: DataTypes.STRING,
                allowNull: true
            }
        };

        return sequelize.define<IDocSourceLabelInstance, IDocSourceLabelAttributes>("docsourcelabels", attributes, {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    name: 'unique_docSourceId_labelId',
                    fields: ["docSourceId", "sourceId"]
                }
            ]
        });
    };