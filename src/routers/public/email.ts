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
        let commentId: number | undefined;
        let docId: number | undefined;

        if (beforeAtArray.length === 3 && beforeAtArray[2].toLowerCase() === "comment") {
            docId = parseInt(beforeAtArray[0]);
            commentId = parseInt(beforeAtArray[1]);
            if (isNaN(commentId) || isNaN(docId)) {
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

        docId = comment ? comment.docId : docId;

        await db.comment.create({
            docId: docId!,
            comment: mail.text,
            parentId: commentId,
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