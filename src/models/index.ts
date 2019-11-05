// src/models/index.ts
import Sequelize from "sequelize";
import { DB_CONNECTION_STRING } from "../config";
import { IVideoAttributes, IVideoInstance, EventsFactory } from "./video";
import { ICommentInstance, ICommentAttributes, CommentsFactory } from "./comments";

export interface IDBInterface {
  videos: Sequelize.Model<IVideoInstance, IVideoAttributes>;
  comment: Sequelize.Model<ICommentInstance, ICommentAttributes>;
  sequelize: Sequelize.Sequelize;
}

const sequelize: Sequelize.Sequelize = new Sequelize(DB_CONNECTION_STRING, {
  logging: false
});

const db: IDBInterface = {
  sequelize,
  videos: EventsFactory(sequelize, Sequelize),
  comment: CommentsFactory(sequelize, Sequelize),
};

db.videos.hasMany(db.comment);

db.sequelize.sync().then(()=> {
  console.log("Database synced successfully")
}).error((error) => {
  console.error("database sync failed", error);
});

export default db;
