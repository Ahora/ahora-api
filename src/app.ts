import ExpressInstance, {Express, Request, Response, NextFunction } from "express";
import { MODE, USERS_API } from "./config";
import { RestCollectorClient, RestCollectorRequest, RestCollectorResult } from "rest-collector";
import bodyParser from "body-parser";
import videosRouter from "./routers/videos";

const app: Express = ExpressInstance();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const revrestClient: RestCollectorClient= new RestCollectorClient(`${USERS_API}/internal/users/getByAccessToken`, { decorateRequest: (req: RestCollectorRequest, bag?: any) => {}});

app.get("/api/status", (req: Request, res: Response, next: NextFunction) => {
    res.send({ok: "ok"});
});

app.use("/api/videos", videosRouter)

export default app;