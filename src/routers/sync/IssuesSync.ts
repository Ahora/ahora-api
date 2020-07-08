import BaseSync from "./BaseSync";
import { Request } from "express";
import { markdownToHTML } from "../../helpers/markdown";
import DocSource from "../../models/docSource";
import Doc from "../../models/docs";

export default class IssuesSync extends BaseSync<Doc> {

    constructor() {
        super(Doc);
    }

    protected async convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<Doc> {
        req.body.htmlDescription = await markdownToHTML(req.body.description, docSource);
        return req.body;
    }

} 