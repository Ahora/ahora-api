import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import authRouter from "./routers/auth";
import marked from "marked";
import db from "./models/index";
import passport from "passport";
import session from "express-session";
const connectSQLite = require("connect-sqlite3");

import routeCreate from "./routers/base";
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

const generateDocHTML = async (doc: IDocAttributes): Promise<IDocAttributes> => {
  return new Promise<IDocAttributes>((resolve, reject) => {
    marked(doc.description, (error: any, parsedResult: string) => {
      if(error) {
        reject(error);
      }
      else {
        doc.htmlDescription = parsedResult;
        resolve(doc);
      }
    });
  });
} 


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


app.use(routeCreate("/api/organizations/:organizationId/labels", db.labels));
app.use(routeCreate("/api/organizations/:organizationId/docs", db.docs, { beforePut: generateDocHTML, beforePost: generateDocHTML}));
app.use("/api/organizations/:organizationId", routeCreate("/docs/:docId/comments", db.comment, { beforePut: generateCommentHTML, beforePost: generateCommentHTML}));
app.use(routeCreate("/api/organizations/:organizationId/docs/:docId/labels", db.docLabels));
app.use(routeCreate("/api/organizations", db.organizations));
app.use("/auth", authRouter)

export default app;