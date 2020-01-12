import express, { Router, Request, Response, NextFunction } from "express";
import bodyParser from "body-parser";


const router: Router = express.Router();

router.post("/", bodyParser.text(), (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.send(req.body);
})

export default router;