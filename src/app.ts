import ExpressInstance, { Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import authRouter from "./routers/auth";
import db from "./models/index";
import passport from "passport";
import session from "express-session";
import publicemailRouter from "./routers/public/email";
import routeCreate from "./routers/base";
import routeDocCreate from "./routers/docs";
import routeOrgCreate from "./routers/organizations";
import usersCreate from "./routers/users";
import RouteTeamUsersCreate from "./routers/teamsusers";
import organizationChildCreate from "./routers/organizationChildBase";
import routeCommentCreate from "./routers/comments";
import routeDocWatchersCreate from "./routers/docWatchers";
import { COOKIE_SECRET, DB_CONNECTION_STRING } from "./config";
import pgSession from "connect-pg-simple";
import { OrganizationType } from "./models/organization";
import { IOrganizationTeamUserInstance } from "./models/organizationTeamsUsers";

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
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/api/public/email", publicemailRouter)


app.use(bodyParser.json());

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
  res.send();
});

app.get("/api/me", (req: Request, res: Response, next: NextFunction) => {
  res.send(req.user);
});

app.use("/api/organizations/:login", async (req: Request, res: Response, next: NextFunction) => {
  const org = await db.organizations.findOne({ where: { login: req.params.login } });
  if (org) {
    req.org = org;
  }
  if (req.org) {
    if (req.org.orgType == OrganizationType.Public) {
      next();
    } else {
      if (req.user) {
        const userPermission: IOrganizationTeamUserInstance | null = await db.organizationTeamsUsers.findOne({
          where: { userId: req.user!.id, organizationId: req.org!.id }
        });

        if (userPermission) {
          next();
        } else {
          res.status(401).send();
        }
      }
      else {
        res.status(401).send();
      }
    }
  } else {
    res.status(404).send();
  }
});

app.get("/api/organizations/:login", async (req: Request, res: Response) => {
  res.send(req.org);
});


app.use(organizationChildCreate("/api/organizations/:login/labels", db.labels));
app.use(organizationChildCreate("/api/organizations/:login/statuses", db.docStatuses));
app.use(organizationChildCreate("/api/organizations/:login/doctypes", db.docTypes));
app.use(organizationChildCreate("/api/organizations/:login/teams", db.organizationTeams));
app.use("/api/organizations/:login", RouteTeamUsersCreate("/teams/:teamId/users"));

app.use(routeDocCreate("/api/organizations/:login/docs"));
app.use("/api/organizations/:login", routeCommentCreate("/docs/:docId/comments"));
app.use("/api/organizations/:login", routeDocWatchersCreate("/docs/:docId/watchers"));
app.use(routeOrgCreate("/api/organizations"));
app.use(usersCreate("/api/users"));
app.use("/auth", authRouter)

export default app;