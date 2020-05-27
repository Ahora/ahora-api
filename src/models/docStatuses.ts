import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import OrganizationMilestone from './milestones';
import DocSourceOrganizationStatus from './docsourcelabel';
import Doc from './docs';

class OrganizationStatus extends Model {
    id!: number;
    name!: string;
    color!: string | null;
    description!: string | null;
    organizationId!: number | null;

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
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
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

OrganizationStatus.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
OrganizationStatus.hasMany(Doc, { foreignKey: "statusId", onDelete: 'CASCADE' });


export default OrganizationStatus;