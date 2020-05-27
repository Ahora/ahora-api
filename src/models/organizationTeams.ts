import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';

class OrganizationTeam extends Model {
    public id!: number;
    public name!: number;
    public organizationId!: number;
    public parentId!: number | null

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationTeam.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizationteams"
});

OrganizationTeam.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
OrganizationTeam.belongsTo(OrganizationTeam, { foreignKey: "parentId", onDelete: 'CASCADE' });
OrganizationTeam.hasOne(OrganizationTeam, { foreignKey: "parentId", onDelete: 'CASCADE' });

export default OrganizationTeam;