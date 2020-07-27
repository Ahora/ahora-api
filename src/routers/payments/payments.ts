import express, { Router, Request, Response, NextFunction } from "express";
import { RestCollectorClient, RestCollectorRequest } from "rest-collector";
import { BLUE_SNAP_SECRET } from "../../config";

const router: Router = express.Router();

const bluesnapClient = new RestCollectorClient("https://sandbox.bluesnap.com/services/2/payment-fields-tokens", {
    decorateRequest: (req: RestCollectorRequest) => {
        req.headers.Authorization = BLUE_SNAP_SECRET;
    }
});

router.get("/", async (req: Request, res: Response, next: NextFunction) => {

    try {
        const result = await bluesnapClient.post();

        const location: string = result.headers.location;
        const splitData = location.split("/");
        res.send({ token: splitData[splitData.length - 1] });
    } catch (error) {
        next(error)
    }

});

export default router;