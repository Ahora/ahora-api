import express, { Router, Request, Response, NextFunction } from "express";
import DocSource from "../../models/docSource";
import { ModelCtor, Model } from "sequelize";

const router = express.Router();

export class SourceableModel extends Model {
    public sourceId?: number;
    public id?: number;
    public docSourceId?: number;
}


export default abstract class BaseSync<M extends SourceableModel> {

    constructor(protected model: ModelCtor<M>) {

    }

    protected async abstract convertDataToModelInstance(body: any, req: Request, docSource: DocSource): Promise<M>;
    protected afterSave(entity: SourceableModel, req: Request): Promise<void> { return Promise.resolve(); };

    public async do(req: Request, docSource: DocSource): Promise<void> {
        const instance: M = await this.convertDataToModelInstance(req.body, req, docSource);
        instance.sourceId = req.body.sourceId;
        instance.docSourceId = docSource.id;

        let instanceFromDB = await this.model.findOne<SourceableModel>({ where: { docSourceId: docSource.id, sourceId: req.body.sourceId } });
        if (instanceFromDB) {
            await this.model.update(instance, { where: { id: instanceFromDB.id! } });
        }
        else {
            instanceFromDB = await this.model.create(req.body);
        }

        await this.afterSave(instanceFromDB, req);
    }
}