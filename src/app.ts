import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import authRouter from "./routers/auth";
import marked from "marked";
import db from "./models/index";
import passport from "passport";
import session from "express-session";
import routeCreate from "./routers/base";
import routeDocCreate from "./routers/docs";
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
  saveUninitialized: true,
  cookie: { maxAge: 365 * 24 * 60 * 60 * 1000 } // 30 days
}));

app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/api/status", (req: Request, res: Response, next: NextFunction) => {
  res.send({ok: "ok", user: req.user, auth: (req as any).auth});
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

app.use(routeCreate("/api/organizations/:login/labels", db.labels));
app.use(routeCreate("/api/organizations/:login/statuses", db.docStatuses));
app.use(routeDocCreate("/api/organizations/:login/docs"));
app.use("/api/organizations/:login", routeCommentCreate("/docs/:docId/comments"));
app.use(routeCreate("/api/organizations/:login/docs/:docId/labels", db.docLabels));
app.use(routeCreate("/api/organizations", db.organizations));
app.use("/auth", authRouter)

export default app;