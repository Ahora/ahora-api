import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IAttachmentsAttributes {
    id?: number;
    organizationId: number;
    contentType: string;
    filename: string;
    identifier: string;
    isUploaded: boolean;
}

export interface IAttachmentsInstance extends Sequelize.Instance<IAttachmentsAttributes>, IAttachmentsAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const AttachmentsFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IAttachmentsInstance, IAttachmentsAttributes> => {
        let attributes: SequelizeAttributes<IAttachmentsAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            organizationId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            contentType: {
                type: DataTypes.STRING,
                allowNull: false
            },
            filename: {
                type: DataTypes.STRING,
                allowNull: false
            },
            identifier: {
                type: DataTypes.STRING,
                allowNull: false
            },
            isUploaded: {
                type: DataTypes.BOOLEAN,
                allowNull: false,
                defaultValue: false
            }
        };

        return sequelize.define<IAttachmentsInstance, IAttachmentsAttributes>("attachments", attributes, {
            timestamps: true
        });
    };