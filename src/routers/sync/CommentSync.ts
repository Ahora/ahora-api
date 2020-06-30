import BaseSync from "./BaseSync";
import Comment from "./../../models/comments"
import { Request } from "express";
import { markdownToHTML } from "../../helpers/markdown";
import DocSource from "../../models/docSource";
import db from "../../models";
import { updateCommentsNumberAndTime } from "../../helpers/comments";

export default class CommentSync extends BaseSync<Comment> {

    constructor() {
        super(Comment);
    }

    protected async afterSave(entity: Comment): Promise<void> {
        await updateCommentsNumberAndTime(entity.docId);
    };

    protected async convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<Comment> {
        req.body.htmlComment = await markdownToHTML(req.body.comment, docSource);
        return req.body;
    }

} 