import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IOrganizationTeamUserAttribute {
    id?: number;
    userId: number;
    organizationId: number;
    teamId: number | null;
}

export interface IOrganizationTeamUserInstance extends Sequelize.Instance<IOrganizationTeamUserAttribute>, IOrganizationTeamUserAttribute {
    id: number;
    user: {
        username: string;
        displayName?: string;
    }
}

// tslint:disable-next-line:typedef
export const OrganizationTeamUserFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IOrganizationTeamUserInstance, IOrganizationTeamUserAttribute> => {
        let attributes: SequelizeAttributes<IOrganizationTeamUserAttribute> = {
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
            teamId: {
                type: DataTypes.INTEGER,
                allowNull: true
            }
        };

        return sequelize.define<IOrganizationTeamUserInstance, IOrganizationTeamUserAttribute>("organizationteamsusers", attributes, {

            timestamps: true
        });
    };