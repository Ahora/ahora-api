
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

class User extends Model {
    public id!: number;
    public displayName!: string | null;
    public username!: string;
    public gitHubId!: string | null;
    public email!: string | null;
    public accessToken!: string | null;
    public refreshToken!: string | null;
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
    gitHubId: {
        type: DataTypes.STRING,
        allowNull: true
    },
    username: {
        type: DataTypes.STRING,
        allowNull: true
    },
    accessToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    refreshToken: {
        type: DataTypes.STRING,
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
            name: 'unique_username',
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
    User.hasMany(Comment, { foreignKey: "authorUserId", onDelete: 'CASCADE', as: "author", });
}

export default User;
