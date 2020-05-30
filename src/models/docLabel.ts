import { Model, DataTypes } from 'sequelize';
import db from '.';
import Doc from './docs';
import User from './users';
import Label from './labels';

class DocLabel extends Model {
    public id!: number;
    public docId!: number;
    public labelId!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocLabel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    docId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    labelId: {
        type: DataTypes.INTEGER,
        allowNull: false
    }
}, {
    sequelize: db.sequelize,
    tableName: "doclabels",
    indexes: [{
        unique: true,
        name: 'docslabel',
        fields: ["docId", "labelId"]
    }]
});

export const initAssociationDocLabel = () => {
    DocLabel.belongsTo(Doc, { foreignKey: "docId", onDelete: 'CASCADE', as: "labels" });
    DocLabel.belongsTo(Label, { foreignKey: "labelId", onDelete: 'CASCADE', as: "tags" });
}

export default DocLabel;