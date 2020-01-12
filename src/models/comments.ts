import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface ICommentAttributes {
    id?: number;
    comment: string;
    htmlComment: string;
    pinned: boolean
    docId: number;
    authorUserId: number;
}

export interface ICommentInstance extends Sequelize.Instance<ICommentAttributes>, ICommentAttributes {
    id: number;
    user: {
        username: string;
        displayName?: string;
    }
}

// tslint:disable-next-line:typedef
export const CommentsFactory = (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
    Sequelize.Model<ICommentInstance, ICommentAttributes> => {
    let attributes: SequelizeAttributes<ICommentAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        comment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        htmlComment: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        docId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        authorUserId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        pinned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        }

    };

    return sequelize.define<ICommentInstance, ICommentAttributes>("comments", attributes, {
        timestamps: true
    });
};