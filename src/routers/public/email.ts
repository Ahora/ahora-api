import express, { Router, Request, Response, NextFunction } from "express";

const router: Router = express.Router();

router.post("/", (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    res.send(req.body);
})

export default router;