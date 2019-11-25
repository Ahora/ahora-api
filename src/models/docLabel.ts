import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IDocLabelAttributes {
    id: number;
    docId: number;
    labeld: number;
}

export interface IDocLabelInstance extends Sequelize.Instance<IDocLabelAttributes>, IDocLabelAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocsLabelFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<IDocLabelInstance, IDocLabelAttributes> => {
    let attributes:SequelizeAttributes<IDocLabelAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        docId: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        labeld: {
            type: DataTypes.INTEGER,
            allowNull: false
        }
    };

    return sequelize.define<IDocLabelInstance, IDocLabelAttributes>("doclabels", attributes, {
        timestamps: true
    });
  };