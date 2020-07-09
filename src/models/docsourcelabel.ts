import db from '.';
import { Model, DataTypes } from 'sequelize';
import Label from './labels';
import DocSource from './docSource';
import { SourceableModel } from '../routers/sync/BaseSync';

class DocSourceLabel extends SourceableModel {
    public id!: number;
    public labelId!: number;
    public name!: string;
    public color!: string | null;
    public description!: string | null;
    public organizationId!: number;

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
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    labelId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    sourceId: {
        type: DataTypes.BIGINT,
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



export const initAssociationDocSourceLabel = () => {
    DocSourceLabel.belongsTo(Label, { foreignKey: "labelId", onDelete: 'CASCADE' });
    DocSourceLabel.belongsTo(DocSource, { foreignKey: "docSourceId", onDelete: 'CASCADE' });
}
export default DocSourceLabel;