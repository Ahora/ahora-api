import express, { Router, Request, Response, NextFunction } from "express";
import BaseSync, { SourceableModel } from "./BaseSync";
import CommentSync from "./CommentSync";
import db from "../../models";
import DocSource from "../../models/docSource";

const router = express.Router();

const entitySyncMap: Map<string, BaseSync<SourceableModel>> = new Map();
entitySyncMap.set("comments", new CommentSync());

router.post("/docsources/:docSourceId/:entity", async (req: Request, res: Response, next: NextFunction) => {
    const syncProvider = entitySyncMap.get(req.params.entity.toLowerCase());
    const docSourceId = parseInt(req.params.docSourceId);
    const docSource = await DocSource.findOne({ where: { id: docSourceId } });
    if (syncProvider && docSource) {
        await syncProvider.do(req, docSource);
        res.send();
    }
    else {
        next();
    }
});

export default router;