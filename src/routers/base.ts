import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance } from "../models/docs";
import Sequelize, { Model, IncludeOptions, FindOptionsAttributesArray } from "sequelize";
import marked from "marked";

export interface RouterHooks<TAttributes, TInstance extends TAttributes> {
    put?: MethodHook<TAttributes, TInstance>;
    get?: GetMethodHook<TAttributes, TInstance>;
    getSingle?: GetMethodHook<TAttributes, TInstance>;
    post?: MethodHook<TAttributes, TInstance>;
    delete?: MethodHook<TAttributes, TInstance>;
    primaryField?: string;
}

export interface GetMethodHook<TAttributes, TInstance extends TAttributes> extends MethodHook<TAttributes, TInstance> {
    include?: Array<Model<any, any> | IncludeOptions>;
    limit?: number;
    raw?: boolean;
    attributes?: FindOptionsAttributesArray;
    group?: string | string[];
    order?: any;
}

export interface MethodHook<TAttributes, TInstance extends TAttributes> {
    before?(entity: TAttributes, req: Request): Promise<TAttributes>;
    getAdditionalParams?(req: Request): any;
    useOnlyAdditionalParams?: boolean;
    after?(entity: TInstance, req?: Request): Promise<TInstance>;
    handleError?(error: any, req: Request, res: Response, next: NextFunction): void;
    disable?: boolean
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>, hooksDelegate: ((req: Request | null) => RouterHooks<TAttributes, TInstance>) | null = null) => {
    const router: Router = express.Router();

    const primaryField: string = (hooksDelegate && hooksDelegate(null).primaryField) || "id";
    const hooksDef = hooksDelegate && hooksDelegate(null);

    if (!(hooksDef && hooksDef.get && hooksDef.get.disable)) {
        router.get(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const hooks = hooksDelegate && hooksDelegate(req);
                let generatedQuery = req.query;
                if (hooks && hooks.get && hooks.get.getAdditionalParams) {
                    const additionalParams: any = await hooks.get.getAdditionalParams(req);
                    if (additionalParams !== null) {
                        if (hooks.get.useOnlyAdditionalParams) {
                            generatedQuery = additionalParams;
                        }
                        else {
                            generatedQuery = { ...req.query, ...additionalParams }
                        }
                    }
                    else {
                        //Incase the additional parameters are null consider the result as not valid and return empty array
                        res.send([]);
                        return;
                    }
                }

                for (const key in req.query) {
                    if (req.query[key] === "null") {
                        req.query[key] = null
                    }
                }

                let include;
                let attributes;
                let group;
                let order;
                let limit: number | undefined;
                let raw: boolean = false;
                if (hooks && hooks.get && hooks.get) {
                    include = hooks.get.include;
                    attributes = hooks.get.attributes;
                    group = hooks.get.group;
                    order = hooks.get.order;
                    limit = hooks.get.limit;
                    raw = !!hooks.get.raw;
                }

                let offset: number | undefined;
                if (req.query.offset) {
                    offset = req.query.offset
                }

                if (group && group.length == 0) {
                    group = undefined;

                }

                const count = await model.count({
                    where: generatedQuery
                });
                res.setHeader("X-Total-Count", count);


                const entities = await model.findAll({
                    where: generatedQuery,
                    attributes,
                    group,
                    include,
                    raw,
                    order,
                    limit,
                    offset
                });

                const newentities: TInstance[] = [];
                for (let index = 0; index < entities.length; index++) {
                    const entity = entities[index];
                    if (hooks && hooks.get && hooks.get.after) {
                        const newEnt = await hooks.get.after(entity, req);
                        newentities.push(newEnt);
                    }
                    else {
                        newentities.push(entity);
                    }
                }

                res.send(newentities);
            } catch (error) {
                next(error);
            }
        });
    }

    if (!(hooksDef && hooksDef.post && hooksDef.post.disable)) {
        router.post(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            const hooks = hooksDelegate && hooksDelegate(req);

            try {
                let body = { ...req.body };
                if (hooks && hooks.post && hooks.post.getAdditionalParams) {
                    body = { ...body, ...await hooks.post.getAdditionalParams(req) }
                }

                if (hooks && hooks.post && hooks.post.before) {
                    body = await hooks.post.before(body, req);
                }

                let entity: TInstance = await model.create(body);

                if (hooks && hooks.post && hooks.post.after) {
                    entity = await hooks.post.after(entity, req);
                }

                res.send(entity);
            } catch (error) {
                if (hooks && hooks.post && hooks.post.handleError) {
                    hooks.post.handleError(error, req, res, next);
                } else {
                    next(error);
                }
            }

        });
    }

    if (!(hooksDef && hooksDef.delete && hooksDef.delete.disable)) {
        router.delete(path + "/:" + primaryField, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const hooks = hooksDelegate && hooksDelegate(req);
                let result: TInstance | null = await model.findOne({ where: ({ [primaryField]: req.params[primaryField] }) as any });
                if (result) {
                    if (hooks && hooks.delete && hooks.delete.before) {
                        await hooks.delete.before(result, req);
                    }
                    await model.destroy({
                        where: { [primaryField]: req.params[primaryField] }
                    });

                    if (hooks && hooks.delete && hooks.delete.after) {
                        await hooks.delete.after(result, req);
                    }
                    res.send();
                }
                else {
                    res.status(404).send();
                }

            } catch (error) {
                next(error);
            }
        });
    }

    if (!(hooksDef && hooksDef.put && hooksDef.put.disable)) {

        router.put(path + "/:" + primaryField, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const hooks = hooksDelegate && hooksDelegate(req); ``
                if (hooks && hooks.put && hooks.put.before) {
                    req.body = await hooks.put.before(req.body, req);
                }
                await model.update(req.body, {
                    where: { [primaryField]: req.params[primaryField] }
                });

                let result: TInstance | null = await model.findOne({ where: ({ [primaryField]: req.params[primaryField] }) as any });

                if (result && hooks && hooks.put && hooks.put.after) {
                    result = await hooks.put.after(result, req);
                }

                res.send(result);
            } catch (error) {
                next(error);
            }
        });
    }

    if (!(hooksDef && hooksDef.get && hooksDef.get.disable)) {
        router.get(path + "/:" + primaryField, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                const hooks = hooksDelegate && hooksDelegate(req);
                let include;
                if (hooks && hooks.getSingle && hooks.getSingle) {
                    include = hooks.getSingle.include
                }

                if (hooks && hooks.getSingle && hooks.getSingle.getAdditionalParams) {
                    req.query = { ...req.query, ...await hooks.getSingle.getAdditionalParams(req) }
                }

                let entity: TInstance | null = await model.findOne({
                    where: {
                        ...req.query,
                        id: req.params[primaryField],
                    },
                    include
                });

                if (entity) {
                    if (hooks && hooks.getSingle && hooks.getSingle.after) {
                        entity = await hooks.getSingle.after(entity, req);
                    }
                    res.send(entity);
                }
                else {
                    res.status(404);
                }
            } catch (error) {
                next(error);
            }
        });
    }

    return router;
}
