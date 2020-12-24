import { Model, DataTypes } from 'sequelize';
import db from '.';
import Comment from './comments';
import Reaction from './reactions';
import User from './users';

class CommentReaction extends Model {
    public id!: number;
    public reactionId!: number;
    public commentId!: number;
    public userId!: number;
}

CommentReaction.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    reactionId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
}, {
    sequelize: db.sequelize,
    tableName: "commentreactions"
});

export const initAssociationCommentReactions = () => {
    CommentReaction.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });
    CommentReaction.belongsTo(Comment, { foreignKey: "commentId", onDelete: 'CASCADE' });
    CommentReaction.belongsTo(Reaction, { foreignKey: "reactionId", onDelete: 'CASCADE' });
}

export default CommentReaction;