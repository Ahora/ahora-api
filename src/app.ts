import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import { MODE, USERS_API } from "./config";
import { RestCollectorClient, RestCollectorRequest, RestCollectorResult } from "rest-collector";
import bodyParser from "body-parser";
import videosRouter from "./routers/videos";
import authRouter from "./routers/auth";
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

const revrestClient: RestCollectorClient= new RestCollectorClient(`${USERS_API}/internal/users/getByAccessToken`, { decorateRequest: (req: RestCollectorRequest, bag?: any) => {}});

app.get("/", (req: Request, res: Response, next: NextFunction) => {
    res.send({ok: "ok", user: req.user, auth: (req as any).auth});
});

app.use("/api/videos", videosRouter)
app.use("/auth", authRouter)

export default app;