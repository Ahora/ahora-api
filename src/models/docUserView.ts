import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocUserViewAttributes {
    id?: number;
    docId: number;
    userId: number;
}

export interface IDocUserViewInstance extends Sequelize.Instance<IDocUserViewAttributes>, IDocUserViewAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocUserViewFactory = (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
    Sequelize.Model<IDocUserViewInstance, IDocUserViewAttributes> => {
    let attributes: SequelizeAttributes<IDocUserViewAttributes> = {
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
        }
    };

    return sequelize.define<IDocUserViewInstance, IDocUserViewAttributes>("docsuserview", attributes, {
        timestamps: true,
        indexes: [
            {
                unique: true,
                name: 'docuserviewdocidanduserid',
                fields: ["docId", "userId"]
            }
        ]
    });
};