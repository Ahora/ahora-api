import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IOrganizationTeamAttribute {
    id?: number;
    name: number;
    organizationId: number;
    parentId?: number
}

export interface IOrganizationTeamInstance extends Sequelize.Instance<IOrganizationTeamAttribute>, IOrganizationTeamAttribute {
    id: number;
}

// tslint:disable-next-line:typedef
export const OrganizationTeamsFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IOrganizationTeamInstance, IOrganizationTeamAttribute> => {
        let attributes: SequelizeAttributes<IOrganizationTeamAttribute> = {
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
        };

        return sequelize.define<IOrganizationTeamInstance, IOrganizationTeamAttribute>("organizationteams", attributes, {

            timestamps: true
        });
    };