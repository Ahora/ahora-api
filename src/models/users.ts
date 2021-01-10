
import { Model, DataTypes, fn, col } from 'sequelize';
import db from '.';
import OrganizationDashboard from './organizationDashboards';
import OrganizationTeamUser from './organizationTeamsUsers';
import Doc from './docs';
import Comment from './comments';
import DocWatcher from './docWatcher';
import DocUserView from './docUserView';
import OrganizationNotification from './OrganizationNotifications';
import OrganizationShortcut from './OrganizationShortcut';
import UserSource from './userSource';
import OrganizationTeam from './organizationTeams';
import Organization from './organization';

export enum UserType {
    User = 0,
    Group = 1
}
class User extends Model {
    public id!: number;
    public displayName!: string | null;
    public username!: string;
    public userType!: UserType;
    public email!: string | null;
    public organizationId!: number | null;
    public avatar!: string | null;
    public teamId!: number | null;

}

User.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: UserType.User
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    teamId: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    email: {
        type: DataTypes.STRING,
        allowNull: true
    }
}, {
    sequelize: db.sequelize,
    tableName: "users",
    indexes: [
        {
            unique: true,
            name: 'unique_username_users',
            fields: ["username"]
        }
    ]
});

export const initAssociationUser = () => {
    User.hasMany(OrganizationDashboard, { foreignKey: "userId", onDelete: 'CASCADE', as: "user" });
    User.hasMany(OrganizationNotification, { foreignKey: "userId", onDelete: 'CASCADE', as: "owner" });
    User.hasMany(OrganizationShortcut, { foreignKey: "userId", onDelete: 'CASCADE' });
    User.hasMany(OrganizationTeamUser, { foreignKey: "userId", onDelete: 'CASCADE' });
    User.hasMany(Doc, { foreignKey: "assigneeUserId", onDelete: 'CASCADE', as: "assignee" });
    User.hasMany(Doc, { foreignKey: "reporterUserId", onDelete: 'CASCADE', as: "reporter" });
    User.hasMany(Doc, { foreignKey: "updatedByUserId", onDelete: 'CASCADE', as: "updatedBy" });
    User.hasMany(DocWatcher, { foreignKey: "userId", onDelete: 'CASCADE', as: "watcher" });
    User.hasMany(DocUserView, { foreignKey: "userId", onDelete: 'CASCADE' });
    User.hasMany(UserSource, { foreignKey: "userId", onDelete: 'CASCADE' });
    User.hasMany(Comment, { foreignKey: "authorUserId", onDelete: 'CASCADE', as: "author", });
    User.belongsTo(OrganizationTeam, { foreignKey: "teamId", onDelete: 'CASCADE' });
    Doc.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
}

export default User;
