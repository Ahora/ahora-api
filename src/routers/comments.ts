import express, { Router, Request, Response, NextFunction } from "express";
import db from "../models";
import { ICommentInstance } from "../models/comments";

const router: Router = express.Router();

router.get("/:eventId/comments", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        console.log("params", req.params);

        const comments: ICommentInstance[] = await db.comment.findAll({
            where: {
                eventId: parseInt(req.params.eventId)
            },
            order: [["createdAt", "desc"]]
        });
        res.send(comments);
    } catch (error) {
        next(error);
    }
});

router.post("/:eventId/comments", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        req.body.eventId = parseInt(req.params.eventId);
        req.body.authorId = req.user.id

        const comment: ICommentInstance = await db.comment.create(req.body);
        res.send(comment);
    } catch (error) {
        next(error);
    }

});

router.delete("/:eventId/comments/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await db.comment.destroy({
            where: { id: req.params.id }
        });
        res.send();
    } catch (error) {
        next(error);
    }
});

router.put("/:eventId/comments/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        await db.comment.update(req.body, {
            where: { id: req.params.id }
        });
        res.send();
    } catch (error) {
        next(error);
    }
});

export default router;