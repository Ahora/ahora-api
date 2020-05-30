import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import User from './users';
import OrganizationTeam from './organizationTeams';

export enum TeamUserType {
    Member = 0,
    Owner = 1
}


class OrganizationTeamUser extends Model {
    public id!: number;
    public userId!: number;
    public permissionType!: TeamUserType;
    public organizationId!: number;
    public teamId!: number | null;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationTeamUser.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    permissionType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: TeamUserType.Member
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizationteamsusers",
    indexes: [
        {
            unique: true,
            name: 'organizationId_teamId_userId',
            fields: ["organizationId", "teamId", "userId"]
        }
    ]
});

export const initAssociationOrganizationTeamsUsers = () => {
    OrganizationTeamUser.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    OrganizationTeamUser.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });
    OrganizationTeamUser.belongsTo(OrganizationTeam, { foreignKey: "teamId", onDelete: 'CASCADE' });
}

export default OrganizationTeamUser;
