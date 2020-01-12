import express, { Router, Request, Response, NextFunction } from "express";
import multer from "multer";
import db from "../../models";
import { IUserInstance } from "../../models/users";
import { ICommentInstance } from "../../models/comments";
const upload = multer();



const router: Router = express.Router();

router.post("/", upload.single(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        const toRaw: string = req.body.to;
        const toArray: string[] = toRaw.split("@");

        const beforeAt = toArray[0];
        const from: string = req.body.envelope.from;
        const beforeAtArray = beforeAt.split("-");
        const commentId: number = -1;

        if (beforeAtArray.length === 2 && beforeAtArray[1].toLowerCase() === "comment") {
            const commentId: number = parseInt(beforeAtArray[0]);
            if (isNaN(commentId)) {
                return null;
            }
        }

        const user: IUserInstance | null = await db.users.findOne({
            where: { email: from }
        });

        if (user === null) {
            return;
        }

        const comment: ICommentInstance | null = await db.comment.findOne({
            where: { id: commentId }
        });

        if (comment === null) {
            return;
        }

        await db.comment.create({
            docId: comment.docId,
            comment: req.body.text,
            htmlComment: req.body.html,
            pinned: false,
            authorUserId: user.id

        });

        res.send();
    } catch (error) {
        console.log(error);
        next(error);
    }
})

export default router;