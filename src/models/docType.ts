
import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import Doc from './docs';

class DocType extends Model {
    public id!: number;

    public name!: string;
    public code!: string;
    public description!: string | null;
    public organizationId!: number | null;
    public nextDocType?: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocType.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    nextDocType: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "DocTypes",
});

export const initAssociationDocType = () => {
    DocType.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    DocType.hasMany(Doc, { foreignKey: "docTypeId", onDelete: 'CASCADE', as: "docType" });
}

export default DocType;