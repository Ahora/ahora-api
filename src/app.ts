import ExpressInstance, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import authRouter from "./routers/auth";
import passport from "passport";
import session from "express-session";
import publicemailRouter from "./routers/public/email";
import routeDocCreate from "./routers/docs";
import routeOrgCreate from "./routers/organizations";
import usersCreate from "./routers/users";
import RouteTeamUsersCreate from "./routers/teamsusers";
import organizationChildCreate from "./routers/organizationChildBase";
import reactionRouteCreate from "./routers/reactions";
import docSourceRouteCreate from "./routers/docSource";
import labelRouteCreate from "./routers/label";
import routeCommentCreate from "./routers/comments";
import smartSyncRoute from "./routers/sync/SmartSyncRoute";
import routeDocSourceMilestoneCreate from "./routers/sync/SyncMilestone";
import routeOrganizationDashboardCreate from "./routers/organizationDashboards";
import routeOrganizationTeamsCreate from "./routers/organizationTeams";
import routeAttachmentstCreate from "./routers/attachments";
import routeDocWatchersCreate from "./routers/docWatchers";
import paymentsRoute from "./routers/payments/payments";
import organizationNotificationRoute from "./routers/organizationNotification";
import organizationShortcutRoute from "./routers/organizationShortcut";
import { COOKIE_SECRET, DB_CONNECTION_STRING } from "./config";
import pgSession from "connect-pg-simple";
import Organization, { OrganizationType } from "./models/organization";
import OrganizationTeamUser from "./models/organizationTeamsUsers";
import OrganizationMilestone from "./models/milestones";
import OrganizationStatus from "./models/docStatuses";
import DocType from "./models/docType";
import initAssociation from "./models/Association";
import internalDocSourceRoute from "./routers/internal/docSources";
import usersInternalRoute from "./routers/internal/users";

import githubRouter from "./routers/github";

initAssociation();

const app: Express = ExpressInstance();

app.use(session({
  store: new (pgSession(session))({
    conString: DB_CONNECTION_STRING
  }),

  secret: COOKIE_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 } // 365 days
}));

app.disable('etag');
app.disable('view cache');

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/public/email", publicemailRouter);
app.use("/internal/sync", smartSyncRoute);
app.use("/internal", usersInternalRoute("/users"));

app.use(bodyParser.json());

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
  res.send();
});


app.use(internalDocSourceRoute);

app.get("/api/me", (req: Request, res: Response, next: NextFunction) => {
  if (req.user) {
    res.send({
      username: req.user.username,
      displayName: req.user.displayName,
      email: req.user.email,
      avatar: req.user.avatar,
      id: req.user.id
    });
  }

});

app.use("/api/organizations/:login", async (req: Request, res: Response, next: NextFunction) => {
  const org = await Organization.findOne({ where: { login: req.params.login } });
  if (org) {
    req.org = org;

    if (req.user) {
      const userPermission: OrganizationTeamUser | null = await OrganizationTeamUser.findOne({
        where: { userId: req.user.id, organizationId: req.org!.id }
      });

      if (userPermission) {
        req.orgPermission = userPermission;
      }
    }
    if (req.org) {
      if (req.org.orgType == OrganizationType.Public) {
        next();
      } else {
        //We are in private mode!
        if (req.orgPermission) {
          next();
        } else {
          res.status(401).send();
        }
      }
    } else {
      res.status(404).send();
    }
  }
});

app.get("/api/organizations/:login", async (req: Request, res: Response) => {
  if (req.org) {
    res.send({
      login: req.org.login,
      displayName: req.org.displayName,
      id: req.org.id,
      orgType: req.org.orgType,
      permission: req.orgPermission,
      defaultStatus: req.org.defaultStatus,
      hasPayment: !!req.org.paymentInfo
    });
  }
});
app.use("/api/payments", paymentsRoute);

app.use(docSourceRouteCreate("/api/organizations/:login/docsources"));
app.use(reactionRouteCreate("/api/reactions"));
app.use(labelRouteCreate("/api/organizations/:login/labels"));
app.use(organizationChildCreate("/api/organizations/:login/milestones", OrganizationMilestone));
app.use(organizationChildCreate("/api/organizations/:login/statuses", OrganizationStatus));
app.use(organizationChildCreate("/api/organizations/:login/doctypes", DocType));
app.use("/api/organizations/:login", RouteTeamUsersCreate("/teams/:teamId/users"));
app.use("/api/organizations/:login", routeDocSourceMilestoneCreate);
app.use(routeDocCreate("/api/organizations/:login/docs"));
app.use("/api/organizations/:login", routeOrganizationTeamsCreate("/teams"));
app.use("/api/organizations/:login", routeOrganizationDashboardCreate("/dashboards"));
app.use("/api/organizations/:login", routeCommentCreate("/docs/:docId/comments"));
app.use("/api/organizations/:login", routeAttachmentstCreate("/attachments"));
app.use("/api/organizations/:login", organizationNotificationRoute("/notifications"));
app.use("/api/organizations/:login", organizationShortcutRoute("/shortcuts"));

app.use("/api/organizations/:login", routeDocWatchersCreate("/docs/:docId/watchers"));
app.use(routeOrgCreate("/api/organizations"));

app.use("/api/github", githubRouter);
app.use("/api/organizations/:login", usersCreate("/users"));
app.use("/auth", authRouter);

export default app;