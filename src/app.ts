import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import videosRouter from "./routers/docs";
import authRouter from "./routers/auth";
import orgsRouter from "./routers/orgs";
import db from "./models/index";
import passport from "passport";
import session from "express-session";
const connectSQLite = require("connect-sqlite3");

import routeCreate from "./routers/base";

const app: Express = ExpressInstance();
const SQLiteStore = connectSQLite(session);
app.use(session({
    store: new SQLiteStore({
    }),
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());

app.get("/", (req: Request, res: Response, next: NextFunction) => {
  res.send({ok: "ok", user: req.user, auth: (req as any).auth});
});

app.post("/", (req: Request, res: Response, next: NextFunction) => {
  res.send(req.body);
});


app.use(routeCreate("/api/organizations/:organizationId/labels", db.labels));
app.use(routeCreate("/api/organizations/:organizationId/docs", db.docs));
app.use(routeCreate("/api/organizations/:organizationId/docs/:docId/comments", db.comment));
app.use(routeCreate("/api/organizations", db.organizations));
app.use("/auth", authRouter)

export default app;