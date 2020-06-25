import BaseSync from "./BaseSync";
import Comment from "./../../models/comments"
import { Request } from "express";
import { markdownToHTML } from "../../helpers/markdown";
import DocSource from "../../models/docSource";

export default class CommentSync extends BaseSync<Comment> {

    constructor() {
        super(Comment);
    }

    protected async convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<Comment> {
        req.body.htmlComment = await markdownToHTML(req.body.comment, docSource);
        return req.body;
    }
} 