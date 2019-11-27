import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface ICommentAttributes {
    id: number;
    comment: string;
    htmlComment: string;
    userAlias: number,

}

export interface ICommentInstance extends Sequelize.Instance<ICommentAttributes>, ICommentAttributes {
    eventId: number;
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
        userAlias: {
            type: DataTypes.STRING,
            allowNull: false,

        }

    };

    return sequelize.define<ICommentInstance, ICommentAttributes>("comments", attributes, {
        timestamps: true
    });
};