// src/models/index.ts
import Sequelize from "sequelize";
import { DB_CONNECTION_STRING } from "../config";
import { IVideoAttributes, IVideoInstance, EventsFactory } from "./video";
import { ICommentInstance, ICommentAttributes, CommentsFactory } from "./comments";
import { IUserInstance, IUserAttributes, UsersFactory } from "./user";
import { IOrganizationInstance, IOrganizationAttributes, OrganizationsFactory } from "./organization";

export interface IDBInterface {
  videos: Sequelize.Model<IVideoInstance, IVideoAttributes>;
  users: Sequelize.Model<IUserInstance, IUserAttributes>;
  comment: Sequelize.Model<ICommentInstance, ICommentAttributes>;
  organizations: Sequelize.Model<IOrganizationInstance, IOrganizationAttributes>;
  sequelize: Sequelize.Sequelize;
}

const sequelize: Sequelize.Sequelize = new Sequelize(DB_CONNECTION_STRING, {
  logging: false
});

const db: IDBInterface = {
  sequelize,
  videos: EventsFactory(sequelize, Sequelize),
  users: UsersFactory(sequelize, Sequelize),
  comment: CommentsFactory(sequelize, Sequelize),
  organizations: OrganizationsFactory(sequelize, Sequelize),
};

db.videos.hasMany(db.comment);

db.sequelize.sync().then(()=> {
  console.log("Database synced successfully")
}).error((error) => {
  console.error("database sync failed", error);
});

export default db;
