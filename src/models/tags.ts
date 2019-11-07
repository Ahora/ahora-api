import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface ITagsAttributes {
    id?: number;
    name: string;
    color: string;
}

export interface ITagInstance extends Sequelize.Instance<ITagsAttributes>, ITagsAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const TagsFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<ITagInstance, ITagsAttributes> => {
    let attributes:SequelizeAttributes<ITagsAttributes> = {
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

    return sequelize.define<ITagInstance, ITagsAttributes>("tags", attributes, {
        timestamps: true
    });
  };