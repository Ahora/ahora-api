import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface ILabelAttributes {
    id?: number;
    name: string;
    color: string;
}

export interface ILabelInstance extends Sequelize.Instance<ILabelAttributes>, ILabelAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const LabelsFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<ILabelInstance, ILabelAttributes> => {
    let attributes:SequelizeAttributes<ILabelAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        }, 
        color: {
            type: DataTypes.STRING,
            allowNull: true
        }
    };

    return sequelize.define<ILabelInstance, ILabelAttributes>("tags", attributes, {
        timestamps: true
    });
  };