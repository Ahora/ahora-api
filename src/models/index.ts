// src/models/index.ts
import { Sequelize, Model } from "sequelize";
import { DB_CONNECTION_STRING } from "../config";

export interface IDBInterface {
  sequelize: Sequelize;
}

const sequelize: Sequelize = new Sequelize(DB_CONNECTION_STRING, {
  //logging: console.log,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  }
});

const db: IDBInterface = {
  sequelize,
};
/*
import fs from 'fs';
const sql: string = fs.readFileSync('./sql/sessions.sql', 'utf8');
db.sequelize.query(sql).then(() => {
  console.log("SQL synced successfully")
}).catch((error) => {
  console.error("SQL sync failed", error);
});


db.sequelize.sync({ force: false }).then(() => {
  console.log("Database synced successfully")
}).error((error) => {
  console.error("database sync failed", error);
});
*/

export default db;
