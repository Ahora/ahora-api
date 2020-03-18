import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance } from "../models/docs";
import Sequelize, { Model, IncludeOptions } from "sequelize";
import marked from "marked";

export interface RouterHooks<TAttributes, TInstance extends TAttributes> {
    put?: MethodHook<TAttributes, TInstance>;
    get?: GetMethodHook<TAttributes, TInstance>;
    post?: MethodHook<TAttributes, TInstance>;
    delete?: MethodHook<TAttributes, TInstance>;
    primaryField?: string;
}

export interface GetMethodHook<TAttributes, TInstance extends TAttributes> extends MethodHook<TAttributes, TInstance> {
    include?: Array<Model<any, any> | IncludeOptions>;
    limit?: number;
}

export interface MethodHook<TAttributes, TInstance extends TAttributes> {
    before?(entity: TAttributes, req: Request): Promise<TAttributes>;
    getAdditionalParams?(req: Request): any;
    useOnlyAdditionalParams?: boolean;
    after?(entity: TInstance, req?: Request): Promise<TInstance>;
    handleError?(error: any, req: Request, res: Response, next: NextFunction): void;
    disable?: boolean
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>, hooks: RouterHooks<TAttributes, TInstance> | null = null) => {
    const router: Router = express.Router();

    const primaryField: string = (hooks && hooks.primaryField) || "id";

    if (!(hooks && hooks.get && hooks.get.disable)) {
        router.get(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                if (hooks && hooks.get && hooks.get.getAdditionalParams) {
                    const additionalParams: any = await hooks.get.getAdditionalParams(req);
                    if (additionalParams !== null) {
                        if (hooks.get.useOnlyAdditionalParams) {
                            req.query = additionalParams;
                        }
                        else {
                            req.query = { ...req.query, ...additionalParams }
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
                let limit: number | undefined;
                if (hooks && hooks.get && hooks.get) {
                    include = hooks.get.include;
                    limit = hooks.get.limit;

                }

                const entities: TInstance[] = await model.findAll({
                    where: req.query,
                    include,
                    order: [["updatedAt", "DESC"]],
                    limit
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

    if (!(hooks && hooks.post && hooks.post.disable)) {

        router.post(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    if (!(hooks && hooks.delete && hooks.delete.disable)) {
        router.delete(path + "/:" + primaryField, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                await model.destroy({
                    where: { [primaryField]: req.params[primaryField] }
                });
                res.send();
            } catch (error) {
                next(error);
            }
        });
    }

    if (!(hooks && hooks.put && hooks.put.disable)) {

        router.put(path + "/:" + primaryField, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
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

    if (!(hooks && hooks.get && hooks.get.disable)) {
        router.get(path + "/:" + primaryField, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
            try {
                let include;
                if (hooks && hooks.get && hooks.get) {
                    include = hooks.get.include
                }

                if (hooks && hooks.get && hooks.get.getAdditionalParams) {
                    req.query = { ...req.query, ...await hooks.get.getAdditionalParams(req) }
                }


                let entity: TInstance | null = await model.findOne({
                    where: {
                        ...req.query,
                        id: req.params[primaryField],
                    },
                    include
                });

                if (entity) {
                    if (hooks && hooks.get && hooks.get.after) {
                        entity = await hooks.get.after(entity, req);
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
