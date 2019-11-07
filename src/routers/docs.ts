import express, { Router, Request, Response, NextFunction } from "express";
import db from "../models";
import { IDocInstance } from "../models/docs";

const router: Router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const videos: IDocInstance[] = await db.videos.findAll({
            where: req.query
        });
        res.send(videos);
    } catch (error) {
        next(error);
    }
});

router.post("/", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const event: IDocInstance = await db.videos.create(req.body);
        res.send(event);
    } catch (error) {
        next(error);
    }

});

router.delete("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await db.videos.destroy({
            where: { id: req.params.id }
        });
        res.send();
    } catch (error) {
        next(error);
    }
});
router.put("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await db.videos.update(req.body, {
            where: { id: req.params.id }
        });
        res.send();
    } catch (error) {
        next(error);
    }
});


router.get("/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const video: IDocInstance | null = await db.videos.findOne({
            where:  {
                id: req.params.id
            }
        });
        res.send(video);
    } catch (error) {
        next(error);
    }
});

export default router;