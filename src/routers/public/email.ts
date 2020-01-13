import express, { Router, Request, Response, NextFunction } from "express";
import db from "../../models";
import { IUserInstance } from "../../models/users";
import { ICommentInstance } from "../../models/comments";
import { simpleParser, ParsedMail } from "mailparser";
import { EMAIL_DOMAIN } from "../../config";
import multer from "multer";

const router: Router = express.Router();

router.post("/", multer().any(), async (req: Request, res: Response, next: NextFunction) => {
    try {
        console.log(req.body.email);
        const mail: ParsedMail = await simpleParser(req.body.email);
        const from: string = mail.from.value[0].address;
        const relevantToEmails: string[] = mail.to.value.filter(email => email.address.endsWith(`@${EMAIL_DOMAIN}`)).map(email => email.address);

        if (relevantToEmails.length === 0) {
            res.status(400).send();
            return;
        }
        const toRaw: string = relevantToEmails[0];
        const toArray: string[] = toRaw.split("@");
        const beforeAt = toArray[0];
        const beforeAtArray = beforeAt.split("-");
        let commentId: number = -1;

        if (beforeAtArray.length === 2 && beforeAtArray[1].toLowerCase() === "comment") {
            commentId = parseInt(beforeAtArray[0]);
            if (isNaN(commentId)) {
                res.status(400).send();
                return null;
            }
        }


        const user: IUserInstance | null = await db.users.findOne({
            where: { email: from }
        });

        if (user === null) {
            res.status(400).send();
            return;
        }

        const comment: ICommentInstance | null = await db.comment.findOne({
            where: { id: commentId }
        });

        if (comment === null) {
            res.status(400).send();
            return;
        }

        await db.comment.create({
            docId: comment.docId,
            comment: mail.text,
            htmlComment: mail.html as any,
            pinned: false,
            authorUserId: user.id
        });

        res.send();
    } catch (error) {
        next(error);
    }
})

export default router;