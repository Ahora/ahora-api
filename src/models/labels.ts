import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import DocSourceLabel from './docsourcelabel';
import DocLabel from './docLabel';

class Label extends Model {
    public id!: number;
    public name!: string;
    public color!: string | null; // for nullable fields
    public description!: string | null; // for nullable fields
    public organizationId!: number | null; // for nullable fields

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Label.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    color: {
        type: DataTypes.STRING,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "tags",
    indexes: [
        {
            unique: true,
            name: 'tags_organizationId_Name',
            fields: ["organizationId", "name"]
        }
    ]
});

export const initAssociationLabel = () => {
    Label.hasMany(DocLabel, { foreignKey: "labelId", onDelete: 'CASCADE' });
    Label.hasMany(DocSourceLabel, { foreignKey: "labelId", onDelete: 'CASCADE' });
    Label.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
}

export default Label;