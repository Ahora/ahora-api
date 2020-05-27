import db from '.';
import { Model, DataTypes } from 'sequelize';
import Label from './labels';
import DocSource from './docSource';

class DocSourceLabel extends Model {
    public id!: number;
    public docSourceId!: number;
    public labelId!: number;
    public sourceId!: number;
    public name!: string;
    public color!: string | null;
    public description!: string | null;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocSourceLabel.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    docSourceId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    labelId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sourceId: {
        type: DataTypes.INTEGER,
        allowNull: false
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
    tableName: "docsourcelabels",
    indexes: [
        {
            unique: true,
            name: 'unique_docSourceId_labelId',
            fields: ["docSourceId", "sourceId"]
        }
    ]
});

DocSourceLabel.belongsTo(Label, { foreignKey: "labelId", onDelete: 'CASCADE' });
DocSourceLabel.belongsTo(DocSource, { foreignKey: "docSourceId", onDelete: 'CASCADE' });

export default DocSourceLabel;