import { Model, DataTypes } from 'sequelize';
import db from '.';
import CommentReaction from './commentReactions';

class Reaction extends Model {
    public id!: number;
    public content!: string;
    public order!: number | null;
    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Reaction.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    order: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    content: {
        type: DataTypes.STRING,
        allowNull: false
    },
}, {
    sequelize: db.sequelize,
    tableName: "reactions",
    indexes: [
        {
            unique: true,
            name: 'reactions_content',
            fields: ["content"]
        }
    ]
});

export const initAssociationReaction = () => {
    Reaction.hasMany(CommentReaction, { foreignKey: "reactionId", onDelete: 'CASCADE' });
}
export default Reaction;