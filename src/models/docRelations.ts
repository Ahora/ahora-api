import * as Sequelize from "sequelize";
import { SequelizeAttributes } from "./base";

export enum DocRelationType {
    Blocking = "Blocking",
    Duplicates = "Duplicates"
}

export interface IDocRelationAttributes {
    id?: number;
    docId: number;
    relatedDocId: number;
    relationType: DocRelationType;
}

export interface IDocRelationInstance extends Sequelize.Instance<IDocRelationAttributes>, IDocRelationAttributes {
    id: number;
}

// tslint:disable-next-line:typedef
export const DocsRelationsFactory =
    (sequelize: Sequelize.Sequelize, DataTypes: Sequelize.DataTypes):
        Sequelize.Model<IDocRelationInstance, IDocRelationAttributes> => {
        let attributes: SequelizeAttributes<IDocRelationAttributes> = {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true
            },
            docId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            relatedDocId: {
                type: DataTypes.INTEGER,
                allowNull: false
            },
            relationType: {
                type: DataTypes.ENUM("Blocking", "Duplicates"),
                allowNull: false,
                defaultValue: DocRelationType.Blocking
            }
        };

        return sequelize.define<IDocRelationInstance, IDocRelationAttributes>("docrelations", attributes, {
            timestamps: true
        });
    };