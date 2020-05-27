
import { Model, DataTypes } from 'sequelize';
import db from '.';
import Doc from './docs';
import User from './users';
import Label from './labels';
import Organization from './organization';

class Attachment extends Model {
    id!: number;
    organizationId!: number;
    contentType!: string;
    filename!: string;
    identifier!: string;
    isUploaded!: boolean;

    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Attachment.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    organizationId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    contentType: {
        type: DataTypes.STRING,
        allowNull: false
    },
    filename: {
        type: DataTypes.STRING,
        allowNull: false
    },
    identifier: {
        type: DataTypes.STRING,
        allowNull: false
    },
    isUploaded: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    }
}, {
    sequelize: db.sequelize,
    tableName: "attachments",
});

Attachment.belongsTo(Organization, { foreignKey: "organizationId", onDelete: 'CASCADE' });

export default Attachment;