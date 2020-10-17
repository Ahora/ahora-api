import { Model, DataTypes } from 'sequelize';
import db from '.';
import Label from './labels';
import OrganizationMilestone from './milestones';
import DocType from './docType';
import organizationDashboards from '../routers/organizationDashboards';
import OrganizationDashboard from './organizationDashboards';
import OrganizationTeam from './organizationTeams';
import OrganizationStatus from './docStatuses';
import DocSource from './docSource';
import OrganizationTeamUser from './organizationTeamsUsers';

export enum OrganizationType {
    Public = 0,
    Private = 1
}
export interface PaymentData {
    cardHolder: string;
    token: string;
    binCategory: string
    ccBin: string
    cardSubType: string
    ccType: string;
    isRegulatedCard: string;
    issuingCountry: string;
    last4Digits: string;
    exp: string;
}

class Organization extends Model {
    public id!: number;
    public login!: string;
    public displayName!: string;
    public node_id!: string | null; // for nullable fields
    public description!: string | null; // for nullable fields
    public defaultStatus!: number | null; // for nullable fields
    public paymentInfo!: PaymentData | null; // for nullable fields
    public orgType!: OrganizationType;


    // timestamps!
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

Organization.init({
    id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    login: {
        type: DataTypes.STRING,
        allowNull: false
    },
    displayName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    paymentInfo: {
        type: DataTypes.JSON,
        allowNull: true
    },
    node_id: {
        type: DataTypes.STRING,
        allowNull: true
    },
    defaultStatus: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true
    },
    orgType: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: OrganizationType.Public
    }
}, {
    sequelize: db.sequelize,
    tableName: "organizations",
    indexes: [
        {
            unique: true,
            name: 'login',
            fields: ["login"]
        }
    ]
});

Organization.afterCreate(async (instance) => {

    await Label.bulkCreate([
        {
            "name": "enhancement",
            "organizationId": instance.id,
            "color": "0366d6",
            "description": "New feature or request",
        },
        {
            "name": "bug",
            "organizationId": instance.id,
            "color": "d73a4a",
            "description": "Something isn't working"
        }]);
})

export const initAssociationOrganization = () => {
    Organization.hasMany(Label, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Organization.hasMany(OrganizationDashboard, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Organization.hasMany(OrganizationStatus, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Organization.hasMany(OrganizationMilestone, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Organization.hasMany(OrganizationTeam, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Organization.hasMany(OrganizationTeamUser, { foreignKey: "organizationId", onDelete: 'CASCADE' });
    Organization.hasMany(DocSource, { foreignKey: "organizationId", onDelete: 'CASCADE', as: "organizationFK" });
    Organization.hasMany(DocType, { foreignKey: "organizationId", onDelete: 'CASCADE' });
}

export default Organization;