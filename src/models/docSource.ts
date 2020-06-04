import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import docsourcelabel from '../routers/docsourcelabel';
import DocSourceLabel from './docsourcelabel';
import Doc from './docs';

export class DocSource extends Model {
    public id!: number;
    public organizationId!: number;
    public organization!: string;
    public repo!: string;
    public lastUpdated!: Date | null;
    public syncing!: boolean;
    public startSyncTime!: Date | null;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocSource.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    organization: {
        type: DataTypes.STRING,
        allowNull: false
    },
    repo: {
        type: DataTypes.STRING,
        allowNull: false
    },
    lastUpdated: {
        type: DataTypes.DATE,
        allowNull: true
    },
    syncing: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    startSyncTime: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "docsources",
    indexes: [
        {
            unique: true,
            name: 'docSources',
            fields: ["organization", "repo"]
        }
    ]
});

export const initAssociationDocSource = () => {
    DocSource.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE', as: "organizationFK" });
    DocSource.hasMany(DocSourceLabel, { foreignKey: "docSourceId", onDelete: 'CASCADE' });
    DocSource.hasMany(Doc, { foreignKey: "docSourceId", onDelete: 'CASCADE', as: "source" });

}

export default DocSource;