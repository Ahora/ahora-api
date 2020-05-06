import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocSourceAttributes {
    id?: number;
    organization: string;
    repo: string;
}

export interface IDocSourceInstance extends Sequelize.Instance<IDocSourceAttributes>, IDocSourceAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocSourcesFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocSourceInstance, IDocSourceAttributes> => {
        let attributes: SequelizeAttributes<IDocSourceAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            organization: {
                type: DataTypes.STRING,
                allowNull: false
            },
            repo: {
                type: DataTypes.STRING,
                allowNull: false
            }
        };

        return sequelize.define<IDocSourceInstance, IDocSourceAttributes>("docsources", attributes, {
            timestamps: true,
            indexes: [
                {
                    unique: true,
                    name: 'docSources',
                    fields: ["organization", "repo"]
                }
            ]
        });
    };