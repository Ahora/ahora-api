import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import Doc from './docs';
import User from './users';

class DocUserView extends Model {
    public id!: number;
    public docId!: number;
    public userId!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocUserView.init({
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
}, {
    sequelize: db.sequelize,
    tableName: "docsuserview",
    indexes: [{
        unique: true,
        name: 'docuserviewdocidanduserid',
        fields: ["docId", "userId"]
    }]
});

export const initAssociationDocUserView = () => {
    DocUserView.belongsTo(Doc, { foreignKey: "docId", onDelete: 'CASCADE', as: "lastView" });
    DocUserView.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });
}

export default DocUserView;