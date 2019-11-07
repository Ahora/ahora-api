// src/models/index.ts
import Sequelize from "sequelize";
import { DB_CONNECTION_STRING } from "../config";
import { IDocInstance, IDocAttributes, EventsFactory } from "./docs";
import { ICommentInstance, ICommentAttributes, CommentsFactory } from "./comments";
import { IUserInstance, IUserAttributes, UsersFactory } from "./users";
import { IOrganizationInstance, IOrganizationAttributes, OrganizationsFactory } from "./organization";
import { ITagInstance, TagsFactory } from "./tags";

export interface IDBInterface {
  docs: Sequelize.Model<IDocInstance, IDocAttributes>;
  users: Sequelize.Model<IUserInstance, IUserAttributes>;
  comment: Sequelize.Model<ICommentInstance, ICommentAttributes>;
  organizations: Sequelize.Model<IOrganizationInstance, IOrganizationAttributes>;
  tags: Sequelize.Model<ITagInstance, ITagInstance>;
  sequelize: Sequelize.Sequelize;
}

const sequelize: Sequelize.Sequelize = new Sequelize(DB_CONNECTION_STRING, {
  logging: false
});

const db: IDBInterface = {
  sequelize,
  docs: EventsFactory(sequelize, Sequelize),
  users: UsersFactory(sequelize, Sequelize),
  comment: CommentsFactory(sequelize, Sequelize),
  organizations: OrganizationsFactory(sequelize, Sequelize),
  tags: TagsFactory(sequelize, Sequelize),
};

db.docs.hasMany(db.comment);
db.organizations.hasMany(db.tags);

db.sequelize.sync().then(()=> {
  console.log("Database synced successfully")
}).error((error) => {
  console.error("database sync failed", error);
});

export default db;
