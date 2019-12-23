// src/models/index.ts
import Sequelize from "sequelize";
import { DB_CONNECTION_STRING } from "../config";
import { IDocInstance, IDocAttributes, EventsFactory } from "./docs";
import { ICommentInstance, ICommentAttributes, CommentsFactory } from "./comments";
import { IUserInstance, IUserAttributes, UsersFactory } from "./users";
import { IOrganizationInstance, IOrganizationAttributes, OrganizationsFactory } from "./organization";
import { ILabelInstance, LabelsFactory, ILabelAttributes } from "./labels";
import { IDocLabelInstance, DocsLabelFactory, IDocLabelAttributes } from "./docLabel";
import { IDocStatusAttributes, IDocStatusInstance, StatusesFactory } from "./docStatuses";
import { IOrganizationUserAttribute, IOrganizationUserInstance, OrganizationPermissionFactory } from "./organizationUsers";

export interface IDBInterface {
  docs: Sequelize.Model<IDocInstance, IDocAttributes>;
  users: Sequelize.Model<IUserInstance, IUserAttributes>;
  comment: Sequelize.Model<ICommentInstance, ICommentAttributes>;
  organizations: Sequelize.Model<IOrganizationInstance, IOrganizationAttributes>;
  labels: Sequelize.Model<ILabelInstance, ILabelAttributes>;
  docLabels: Sequelize.Model<IDocLabelInstance, IDocLabelAttributes>;
  docStatuses: Sequelize.Model<IDocStatusInstance, IDocStatusAttributes>;
  organizationUsers: Sequelize.Model<IOrganizationUserInstance, IOrganizationUserAttribute>;
  sequelize: Sequelize.Sequelize;
}

const sequelize: Sequelize.Sequelize = new Sequelize(DB_CONNECTION_STRING, {
  logging: true
});

const db: IDBInterface = {
  sequelize,
  docs: EventsFactory(sequelize, Sequelize),
  users: UsersFactory(sequelize, Sequelize),
  comment: CommentsFactory(sequelize, Sequelize),
  organizations: OrganizationsFactory(sequelize, Sequelize),
  labels: LabelsFactory(sequelize, Sequelize),
  docLabels: DocsLabelFactory(sequelize, Sequelize),
  docStatuses: StatusesFactory(sequelize, Sequelize),
  organizationUsers: OrganizationPermissionFactory(sequelize, Sequelize)
};

db.organizations.hasMany(db.labels);
db.docs.hasMany(db.docLabels);
db.docs.hasOne(db.docStatuses);
db.organizations.hasOne(db.docStatuses);
db.organizations.hasMany(db.docStatuses);
db.docs.hasMany(db.docStatuses);
db.labels.hasMany(db.docLabels);

db.organizations.hasMany(db.organizationUsers);

db.organizationUsers.belongsTo(db.users,{foreignKey: 'userId'});
db.users.hasMany(db.organizationUsers,{foreignKey : 'userId'});

db.comment.belongsTo(db.docs,{foreignKey: 'docId'});
db.docs.hasMany(db.comment,{foreignKey : 'docId'});

db.comment.belongsTo(db.users,{foreignKey: 'authorUserId'});
db.users.hasMany(db.users,{foreignKey : 'authorUserId'});

/*
db.sequelize.sync({ force: true }).then(()=> {
  console.log("Database synced successfully")
}).error((error) => {
  console.error("database sync failed", error);
});
*/
export default db;
