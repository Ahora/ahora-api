import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import authRouter from "./routers/auth";
import marked from "marked";
import db from "./models/index";
import passport from "passport";
import session from "express-session";
const connectSQLite = require("connect-sqlite3");

import routeCreate from "./routers/base";
import routeDocCreate from "./routers/docs";
import { IDocAttributes } from "./models/docs";
import { ICommentAttributes } from "./models/comments";

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

app.get("/api/status", (req: Request, res: Response, next: NextFunction) => {
  res.send({ok: "ok", user: req.user, auth: (req as any).auth});
});

app.get("/api/me", (req: Request, res: Response, next: NextFunction) => {
  res.send(req.user);
});

const generateCommentHTML = async (comment: ICommentAttributes): Promise<ICommentAttributes> => {
  return new Promise<ICommentAttributes>((resolve, reject) => {
    marked(comment.comment, (error: any, parsedResult: string) => {
      if(error) {
        reject(error);
      }
      else {
        comment.htmlComment = parsedResult;
        resolve(comment);
      }
    });
  });
}

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
app.use("/api/organizations/:login", routeCreate("/docs/:docId/comments", db.comment, { beforePut: generateCommentHTML, beforePost: generateCommentHTML}));
app.use(routeCreate("/api/organizations/:login/docs/:docId/labels", db.docLabels));
app.use(routeCreate("/api/organizations", db.organizations));
app.use("/auth", authRouter)

export default app;