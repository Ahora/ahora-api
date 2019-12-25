import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance } from "../models/docs";
import Sequelize, { Model, IncludeOptions } from "sequelize";
import marked from "marked";

export interface RouterHooks<TAttributes> {
    put?: MethodHook<TAttributes>;
    get?: GetMethodHook<TAttributes>;
    post?: MethodHook<TAttributes>;
    delete?: MethodHook<TAttributes>;
}

export interface GetMethodHook<TAttributes> extends MethodHook<TAttributes> {
    include?: Array<Model<any, any> | IncludeOptions>;
}

export interface MethodHook<TAttributes> {
    before?(entity: TAttributes, req: Request): Promise<TAttributes>;
    getAdditionalParams?(req: Request): any;
    useOnlyAdditionalParams?: boolean;
    after?(entity: TAttributes, req?: Request): Promise<TAttributes>;
    handleError?(error: any, req: Request, res: Response, next: NextFunction): void;
}

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>, hooks: RouterHooks<TAttributes> | null = null) => {
    const router: Router = express.Router();

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

            let include;
            if (hooks && hooks.get && hooks.get) {
                include = hooks.get.include
            }

            console.log(req.query);
            const entity: TInstance[] = await model.findAll({ where: req.query, include });
            res.send(entity);
        } catch (error) {
            console.log(error);
            next(error);
        }
    });

    router.post(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (hooks && hooks.post && hooks.post.getAdditionalParams) {
                req.body = { ...req.body, ...await hooks.post.getAdditionalParams(req) }
            }
            if (req.user)
                req.body.userAlias = (req.user! as any).username;

            if (hooks && hooks.post && hooks.post.before) {
                req.body = await hooks.post.before(req.body, req);
            }

            let include;
            if (hooks && hooks.get && hooks.get) {
                include = hooks.get.include
            }

            let entity: TAttributes = await model.create(req.body, { include });

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

    router.delete(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await model.destroy({
                where: { id: req.params.id }
            });
            res.send();
        } catch (error) {
            next(error);
        }
    });
    router.put(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if (hooks && hooks.put && hooks.put.before) {
                req.body = await hooks.put.before(req.body, req);
            }
            await model.update(req.body, {
                where: { id: req.params.id }
            });

            const result = await model.findOne({ where: { id: req.params.id } });
            res.send(result);
        } catch (error) {
            next(error);
        }
    });


    router.get(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            let include;
            if (hooks && hooks.get && hooks.get) {
                include = hooks.get.include
            }

            if (hooks && hooks.get && hooks.get.getAdditionalParams) {
                req.query = { ...req.query, ...await hooks.get.getAdditionalParams(req) }
            }


            const entity: TInstance | null = await model.findOne({
                where: {
                    ...req.query,
                    id: req.params.id,
                },
                include
            });

            if ((entity as any).description) {
                marked((entity as any).description, (error: any, parsedResult: string) => {
                    (entity as any).dataValues.htmlDescription = parsedResult;
                    res.send(entity);

                });
            }
            else {
                res.send(entity);
            }
        } catch (error) {
            next(error);
        }
    });

    return router;
}
