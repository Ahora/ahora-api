import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import Doc from './docs';
import User from './users';

export enum DocWatcherType {
    Watcher = 0,
    NonWatcher = 1
}


class DocWatcher extends Model {
    public id!: number;
    public docId!: number;
    public watcherType!: DocWatcherType;
    public userId!: number;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

DocWatcher.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    docId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    watcherType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: DocWatcherType.Watcher
    }
}, {
    sequelize: db.sequelize,
    tableName: "docwatchers",
    indexes: [{
        unique: true,
        name: 'docidanduserid',
        fields: ["docId", "userId"]
    }]
});

DocWatcher.belongsTo(Doc, { foreignKey: "docId", onDelete: 'CASCADE' });
DocWatcher.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE' });

export default DocWatcher;