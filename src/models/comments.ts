import { Model, DataTypes } from 'sequelize';
import db from '.';
import Doc from './docs';
import User from './users';

class Comment extends Model {
    public id!: number;
    public comment!: string;
    public commentId!: number | null;
    public htmlComment!: string;
    public pinned!: boolean;
    public parentId!: number | null;
    public docId!: number;
    public authorUserId!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Comment.init({
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
}, {
    sequelize: db.sequelize,
    tableName: "comments",
});

Comment.belongsTo(Doc, { foreignKey: "docId", onDelete: 'CASCADE' });
Comment.belongsTo(Comment, { foreignKey: "parentId", onDelete: 'CASCADE' });
Comment.hasMany(Comment, { foreignKey: "parentId", onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: "authorUserId", onDelete: 'CASCADE' });

export default Comment;