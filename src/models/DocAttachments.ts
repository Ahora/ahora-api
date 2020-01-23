import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocAttachmentsAttributes {
    id?: number;
    docId: number;
    contentType: string;
    bucket: string;
    identifier: string;
}

export interface IDocAttachmentsInstance extends Sequelize.Instance<IDocAttachmentsAttributes>, IDocAttachmentsAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocAttachmentsFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocAttachmentsInstance, IDocAttachmentsAttributes> => {
        let attributes: SequelizeAttributes<IDocAttachmentsAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            docId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            contentType: {
                type: DataTypes.STRING,
                allowNull: false
            },
            bucket: {
                type: DataTypes.STRING,
                allowNull: false
            },
            identifier: {
                type: DataTypes.STRING,
                allowNull: false
            }
        };

        return sequelize.define<IDocAttachmentsInstance, IDocAttachmentsAttributes>("docattachments", attributes, {
            timestamps: true
        });
    };