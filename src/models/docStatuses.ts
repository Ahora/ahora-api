import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import Doc from './docs';

class OrganizationStatus extends Model {
    id!: number;
    name!: string;
    color!: string | null;
    description!: string | null;
    organizationId!: number | null;
    hideFromSelection!: boolean;
    updateCloseTime!: boolean;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationStatus.init({
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
    updateCloseTime: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    hideFromSelection: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: db.sequelize,
    tableName: "DocStatuses",
    indexes: [
        {
            unique: true,
            name: 'status_organizationId_Name',
            fields: ["organizationId", "name"]
        }
    ]
});

export const initAssociationOrganizationStatus = () => {
    OrganizationStatus.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    OrganizationStatus.hasMany(Doc, { foreignKey: "statusId", onDelete: 'CASCADE', as: "status" });
}

export default OrganizationStatus;