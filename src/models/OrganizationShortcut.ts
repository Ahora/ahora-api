import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import User from './users';
import { SearchCriterias } from '../helpers/docs/db';

class OrganizationShortcut extends Model {
    public id!: number;
    public organizationId!: number;
    public userId!: number;
    public title!: string;
    public searchCriteria!: SearchCriterias;
    public star!: boolean;
    public muted!: boolean;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationShortcut.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    title: {
        type: DataTypes.STRING,
        allowNull: true
    },
    searchCriteria: {
        type: DataTypes.JSON,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    star: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    muted: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizationshortcut",
});

export const initAssociationOrganizationShortcut = () => {
    OrganizationShortcut.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    OrganizationShortcut.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });
}

export default OrganizationShortcut;
