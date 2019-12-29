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
import { IDocTypeAttributes, IDocTypeInstance, DocTypesFactory } from "./docType";

export interface IDBInterface {
  docs: Sequelize.Model<IDocInstance, IDocAttributes>;
  users: Sequelize.Model<IUserInstance, IUserAttributes>;
  comment: Sequelize.Model<ICommentInstance, ICommentAttributes>;
  organizations: Sequelize.Model<IOrganizationInstance, IOrganizationAttributes>;
  labels: Sequelize.Model<ILabelInstance, ILabelAttributes>;
  docLabels: Sequelize.Model<IDocLabelInstance, IDocLabelAttributes>;
  docStatuses: Sequelize.Model<IDocStatusInstance, IDocStatusAttributes>;
  organizationUsers: Sequelize.Model<IOrganizationUserInstance, IOrganizationUserAttribute>;
  docTypes: Sequelize.Model<IDocTypeInstance, IDocTypeAttributes>;
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
  organizationUsers: OrganizationPermissionFactory(sequelize, Sequelize),
  docTypes: DocTypesFactory(sequelize, Sequelize)
};

db.organizations.hasMany(db.labels);
db.docs.hasOne(db.docStatuses, { foreignKey: 'status' });
db.docs.hasOne(db.docTypes, { foreignKey: 'docTypeId' });
db.organizations.hasMany(db.docStatuses);
db.docs.hasOne(db.docTypes);
db.organizations.hasMany(db.docTypes);
db.labels.hasMany(db.docLabels);

db.organizations.hasMany(db.organizationUsers);

db.organizationUsers.belongsTo(db.users, { foreignKey: 'userId' });
db.users.hasMany(db.organizationUsers, { foreignKey: 'userId' });

db.comment.belongsTo(db.docs, { foreignKey: 'docId' });
db.docs.hasMany(db.comment, { foreignKey: 'docId' });

db.comment.belongsTo(db.users, { foreignKey: 'authorUserId' });

db.docs.belongsTo(db.users, { as: "assignee", foreignKey: 'assigneeUserId' });
db.users.hasMany(db.docs, { foreignKey: 'assigneeUserId' });

db.docs.hasMany(db.docLabels, { as: "labels", foreignKey: 'docId' });
db.docLabels.belongsTo(db.docs, { foreignKey: 'docId' });

/*
db.sequelize.sync({ force: false }).then(()=> {
  console.log("Database synced successfully")
}).error((error) => {
  console.error("database sync failed", error);
});
*/
export default db;
