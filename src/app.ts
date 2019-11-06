import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";
import videosRouter from "./routers/videos";
import authRouter from "./routers/auth";
import orgsRouter from "./routers/orgs";
import passport from "passport";
import session from "express-session";


const app: Express = ExpressInstance();
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
  }))
app.use(passport.initialize());
app.use(passport.session());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));


app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send({ok: "ok", user: req.user, auth: (req as any).auth});
});

app.use("/api/videos", videosRouter)
app.use("/api/organizations", orgsRouter)
app.use("/auth", authRouter)

export default app;