import express, { Router, Request, Response, NextFunction } from "express";
import Comment from "../../models/comments";
import { simpleParser, ParsedMail } from "mailparser";
import { EMAIL_DOMAIN } from "../../config";
import multer from "multer";
import { notifyComment } from "../../helpers/notifier";
import Doc from "../../models/docs";
import Organization from "../../models/organization";
import User from "../../models/users";

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

        const user: User | null = await User.findOne({
            where: { email: from }
        });

        if (user === null) {
            res.status(400).send();
            return;
        }

        const comment: Comment | null = await Comment.findByPk(commentId);

        docId = comment ? comment.docId : docId;

        const addedComment = await Comment.create({
            docId: docId!,
            comment: mail.text,
            updatedAt: new Date(),
            createdAt: new Date(),
            parentId: commentId,
            htmlComment: mail.html as any,
            pinned: false,
            authorUserId: user.id
        });

        const currentDoc: Doc | null = await Doc.findOne({ where: { id: addedComment.docId } });
        if (currentDoc) {
            const currentOrg: Organization | null = await Organization.findOne({ where: { id: currentDoc.organizationId } });
            if (currentOrg) {
                await notifyComment(req.user!, currentDoc, addedComment, currentOrg);
            }
        }

        res.send();
    } catch (error) {
        next(error);
    }
})

export default router;