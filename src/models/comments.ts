import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface ICommentAttributes {
    id?: number;
    comment: string;
    commentId?: number;
    htmlComment: string;
    pinned: boolean;
    parentId?: number;
    docId: number;
    authorUserId: number;
    createdAt: Date;
    updatedAt: Date;
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
        commentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        authorUserId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        parentId: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        pinned: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: false
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: true
        }

    };

    return sequelize.define<ICommentInstance, ICommentAttributes>("comments", attributes, {
        timestamps: false
    });
};