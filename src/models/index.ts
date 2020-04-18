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
import { IDocTypeAttributes, IDocTypeInstance, DocTypesFactory } from "./docType";
import { IDocWatcherInstance, IDocWatcherAttributes, DocWatchersFactory } from "./docWatcher";
import { IOrganizationTeamAttribute, IOrganizationTeamInstance, OrganizationTeamsFactory } from "./organizationTeams";
import { IOrganizationTeamUserAttribute, IOrganizationTeamUserInstance, OrganizationTeamUserFactory } from "./organizationTeamsUsers";
import { IAttachmentsInstance, IAttachmentsAttributes, AttachmentsFactory } from "./attachments";
import { IDocUserViewInstance, IDocUserViewAttributes, DocUserViewFactory } from "./docUserView";

export interface IDBInterface {
  docs: Sequelize.Model<IDocInstance, IDocAttributes>;
  users: Sequelize.Model<IUserInstance, IUserAttributes>;
  comment: Sequelize.Model<ICommentInstance, ICommentAttributes>;
  organizations: Sequelize.Model<IOrganizationInstance, IOrganizationAttributes>;
  labels: Sequelize.Model<ILabelInstance, ILabelAttributes>;
  attachments: Sequelize.Model<IAttachmentsInstance, IAttachmentsAttributes>;
  docLabels: Sequelize.Model<IDocLabelInstance, IDocLabelAttributes>;
  docUserView: Sequelize.Model<IDocUserViewInstance, IDocUserViewAttributes>;
  docStatuses: Sequelize.Model<IDocStatusInstance, IDocStatusAttributes>;
  docTypes: Sequelize.Model<IDocTypeInstance, IDocTypeAttributes>;
  docWatchers: Sequelize.Model<IDocWatcherInstance, IDocWatcherAttributes>;
  organizationTeams: Sequelize.Model<IOrganizationTeamInstance, IOrganizationTeamAttribute>;
  organizationTeamsUsers: Sequelize.Model<IOrganizationTeamUserInstance, IOrganizationTeamUserAttribute>;
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
  attachments: AttachmentsFactory(sequelize, Sequelize),
  docLabels: DocsLabelFactory(sequelize, Sequelize),
  docStatuses: StatusesFactory(sequelize, Sequelize),
  docTypes: DocTypesFactory(sequelize, Sequelize),
  docWatchers: DocWatchersFactory(sequelize, Sequelize),
  organizationTeams: OrganizationTeamsFactory(sequelize, Sequelize),
  organizationTeamsUsers: OrganizationTeamUserFactory(sequelize, Sequelize),
  docUserView: DocUserViewFactory(sequelize, Sequelize)
};

db.organizations.hasMany(db.labels);

db.docs.belongsTo(db.docTypes, { as: "docType", foreignKey: 'docTypeId', onDelete: "CASCADE" });
db.docTypes.hasMany(db.docs, { foreignKey: 'docTypeId', onDelete: "CASCADE" });

db.docs.belongsTo(db.docStatuses, { as: "status", foreignKey: 'statusId', onDelete: "CASCADE" });
db.docStatuses.hasMany(db.docs, { foreignKey: 'statusId', onDelete: "CASCADE" });


db.organizations.hasMany(db.attachments);
db.organizations.hasMany(db.organizationTeams);

db.labels.hasMany(db.docLabels);


db.organizationTeams.hasMany(db.organizationTeamsUsers);
db.organizationTeamsUsers.belongsTo(db.users, { foreignKey: 'userId', onDelete: "CASCADE" });
db.users.hasMany(db.organizationTeamsUsers, { foreignKey: 'userId', onDelete: "CASCADE" });


db.organizationTeams.belongsTo(db.organizationTeams, { foreignKey: 'parentId', onDelete: "CASCADE" });
db.organizationTeams.hasOne(db.organizationTeams, { foreignKey: 'parentId', onDelete: "CASCADE" });


db.comment.belongsTo(db.docs, { foreignKey: 'docId', onDelete: "CASCADE" });
db.docs.hasMany(db.comment, { foreignKey: 'docId', onDelete: "CASCADE" });
db.comment.belongsTo(db.users, { foreignKey: 'authorUserId', onDelete: "CASCADE" });

db.docWatchers.belongsTo(db.docs, { foreignKey: 'docId', onDelete: "CASCADE" });
db.docs.hasMany(db.docWatchers, { foreignKey: 'docId', onDelete: "CASCADE" });
db.docWatchers.belongsTo(db.users, { foreignKey: 'userId', onDelete: "CASCADE" });

db.docUserView.belongsTo(db.docs, { foreignKey: 'docId', onDelete: "CASCADE" });
db.docs.hasMany(db.docUserView, { as: "lastView", foreignKey: 'docId', onDelete: "CASCADE" });
db.docUserView.belongsTo(db.users, { foreignKey: 'userId', onDelete: "CASCADE" });

db.docs.belongsTo(db.users, { as: "assignee", foreignKey: 'assigneeUserId', onDelete: "CASCADE" });
db.users.hasMany(db.docs, { foreignKey: 'assigneeUserId', onDelete: "CASCADE" });

db.docs.belongsTo(db.users, { as: "reporter", foreignKey: 'reporterUserId', onDelete: "CASCADE" });
db.users.hasMany(db.docs, { foreignKey: 'reporterUserId', onDelete: "CASCADE" });

db.docs.hasMany(db.docLabels, { as: "labels", foreignKey: 'docId', onDelete: "CASCADE" });
db.docLabels.belongsTo(db.docs, { foreignKey: 'docId', onDelete: "CASCADE" });

db.docs.hasMany(db.docLabels, { as: "labelsquery", foreignKey: 'docId', onDelete: "CASCADE" });

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
