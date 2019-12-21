import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import authRouter from "./routers/auth";
import db from "./models/index";
import passport from "passport";
import session from "express-session";
import routeCreate from "./routers/base";
import routeDocCreate from "./routers/docs";
import routeOrgCreate from "./routers/organizations";
import organizationUsersCreate from "./routers/organizationUsers";
import organizationChildCreate from "./routers/organizationChildBase";
import routeCommentCreate from "./routers/comments";
import { COOKIE_SECRET, DB_CONNECTION_STRING } from "./config";
import pgSession from "connect-pg-simple";

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
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/status", (req: Request, res: Response, next: NextFunction) => {
  res.send();
});

app.get("/api/me", (req: Request, res: Response, next: NextFunction) => {
  res.send(req.user);
});

app.use("/api/organizations/:login", async (req: Request, res: Response, next: NextFunction) => {
  const org = await db.organizations.findOne({ where: { login: req.params.login }});
  if(org) {
    req.org = org;
  }
  next();
});

app.get("/api/organizations/:login", async (req: Request, res: Response) => {
  if(req.org) {
    res.send(req.org);
  } else {
    res.status(404).send();
  }
});

app.use(organizationChildCreate("/api/organizations/:login/labels", db.labels));
app.use(organizationUsersCreate("/api/organizations/:login/users"));
app.use(organizationChildCreate("/api/organizations/:login/statuses", db.docStatuses));
app.use(routeDocCreate("/api/organizations/:login/docs"));
app.use("/api/organizations/:login", routeCommentCreate("/docs/:docId/comments"));
app.use(routeCreate("/api/organizations/:login/docs/:docId/labels", db.docLabels));
app.use(routeOrgCreate("/api/organizations"));
app.use("/auth", authRouter)

export default app;