import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import User, { UserType } from './users';

class OrganizationTeam extends Model {
    public id!: number;
    public name!: string;
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

OrganizationTeam.afterCreate(async (instance) => {
    const user = await User.create({
        username: instance.name.replace(/[^a-zA-Z0-9]/g, ""),
        displayName: instance.name,
        organizationId: instance.organizationId,
        userType: UserType.Group,
        teamId: instance.id
    });
});

OrganizationTeam.afterUpdate(async (instance) => {
    await User.update({
        teamId: instance.id,
        username: instance.name.replace(/[^a-zA-Z0-9]/g, ""),
        displayName: instance.name,
        organizationId: instance.organizationId,
        userType: UserType.Group
    },
        {
            where: { teamId: instance.id }
        }
    );
});

export const initAssociationOrganizationTeams = () => {
    OrganizationTeam.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    OrganizationTeam.belongsTo(OrganizationTeam, { foreignKey: "parentId", onDelete: 'CASCADE' });
    OrganizationTeam.hasOne(OrganizationTeam, { foreignKey: "parentId", onDelete: 'CASCADE' });
    OrganizationTeam.hasOne(User, { foreignKey: "teamId", onDelete: 'CASCADE' });
}

export default OrganizationTeam;