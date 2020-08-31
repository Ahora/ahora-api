import { Model, DataTypes } from 'sequelize';
import db from '.';
import Doc from './docs';
import Comment from './comments';
import User from './users';

class Mention extends Model {
    public id!: number;
    public docId!: number;
    public commentId!: number;
    public userId!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Mention.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    docId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    commentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db.sequelize,
    tableName: "mentions",
    indexes: [{
        unique: true,
        name: 'mention_nique',
        fields: ["docId", "commentId", "userId"]
    }]
});

export const initAssociationMentions = () => {
    Mention.belongsTo(Doc, { foreignKey: "docId", onDelete: 'CASCADE' });
    Mention.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });
    Mention.belongsTo(Comment, { foreignKey: "commentId", onDelete: 'CASCADE' });
}

export default Mention;