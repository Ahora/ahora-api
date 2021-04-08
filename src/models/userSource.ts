
import { Model, DataTypes } from 'sequelize';
import db from '.';
import User from './users';

export enum UserAuthSource {
    Github = 0,
    Google = 1,
}
class UserSource extends Model {
    public id!: number;
    public username!: string;
    public authSource!: UserAuthSource;
    public avatar!: string | null;
    public authSourceId!: string | null;
    public email!: string | null;
    public accessToken!: string | null;
    public location!: string | null;
    public company!: string | null;
    public refreshToken!: string | null;
    public userId!: number;
}

UserSource.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    authSource: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: UserAuthSource.Github
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    authSourceId: {
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
    },
    location: {
        type: DataTypes.STRING,
        allowNull: true
    },
    company: {
        type: DataTypes.STRING,
        allowNull: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },

}, {
    sequelize: db.sequelize,
    tableName: "usersources",
    indexes: [
        {
            unique: true,
            name: 'unique_username_usersource',
            fields: ["username", "authSource"]
        }
    ]
});

export const initAssociationUserSources = () => {
    UserSource.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });
}

export default UserSource;
