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

    const result = await bluesnapClient.post();

    const location: string = result.headers.location;
    const splitData = location.split("/");
    res.send({ token: splitData[splitData.length - 1] });
})


router.post("/:orgId", async (req: Request, res: Response, next: NextFunction) => {

    const result = await bluesnapClient.post({
        data: {
            "pfToken": "812f6ee706e463d3276e3abeb21fa94072e40695ed423ddac244409b3b652eff_",
            "amount": 11,
            "currency": "USD",
            "cardTransactionType": "AUTH_CAPTURE",
            "cardHolderInfo": {
                "firstName": "Jane",
                "lastName": "Shopper",
                "zip": "02451"
            }
        }
    });

    console.log(result);
})

export default router;