import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export interface IVideoAttributes {
    id: number;
    subject: string;
    description: string;
    docType: string;
    userAlias: string;
    metadata: any;
}

export interface IVideoInstance extends Sequelize.Instance<IVideoAttributes>, IVideoAttributes {
}

// tslint:disable-next-line:typedef
export const EventsFactory =
(sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
Sequelize.Model<IVideoInstance, IVideoAttributes> => {
    let attributes:SequelizeAttributes<IVideoAttributes> = {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true
        },
        subject: {
            type: DataTypes.STRING,
            allowNull: false
        },
        docType: {
            type: DataTypes.STRING,
            allowNull: false
        },
        metadata: {
            type: DataTypes.JSON,
            allowNull: true
        },
        description: {
            type: DataTypes.STRING,
            allowNull: true
        },
        userAlias: {
            type: DataTypes.STRING
        }
    };

    return sequelize.define<IVideoInstance, IVideoAttributes>("videos", attributes, {
        timestamps: true
    });
  };