import { Model, DataTypes } from 'sequelize';
import db from '.';
import Organization from './organization';
import User from './users';

enum NotificationTrigger {
    OnCreate = 1,
    OnUpdate = 2,
    OnEdit = 4,
    OnComment = 8,
    OnClose = 16,
    onStatusChanged = 32
}

class OrganizationNotification extends Model {
    public id!: number;
    public organizationId!: number;
    public userId!: number;
    public title!: string;
    public description!: string | null;
    public searchCriteria!: string;
    public trigger!: NotificationTrigger;


    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

OrganizationNotification.init({
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
    notificationTrigger: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizationnotifications",
});

export const initAssociationOrganizationNotification = () => {
    OrganizationNotification.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    OrganizationNotification.belongsTo(User, { foreignKey: "userId", onDelete: 'CASCADE', as: "owner" });
}


export default OrganizationNotification;
