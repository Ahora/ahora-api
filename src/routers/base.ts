import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance } from "../models/docs";
import Sequelize from "sequelize";
import marked from "marked";

export interface RouterHooks<TAttributes> {
    put?: MethodHook<TAttributes>;
    get?: MethodHook<TAttributes>;
    post?: MethodHook<TAttributes>;
    delete?: MethodHook<TAttributes>;
}

export interface MethodHook<TAttributes> {
    before?(entity: TAttributes, req: Request): Promise<TAttributes>;
    getAdditionalParams?(req: Request): any;
    before?(after: TAttributes, req?: Request): Promise<TAttributes>;
}

export default <TInstance, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>, hooks: RouterHooks<TAttributes> | null = null) => {
    const router: Router = express.Router();
        
    router.get(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {

            if(hooks && hooks.get && hooks.get.getAdditionalParams) {
                req.query = {...req.query, ...hooks.get.getAdditionalParams(req)}
            }
            const entity: TInstance[] = await model.findAll({where: req.query });
            res.send(entity);
        } catch (error) {
            next(error);
        }
    });

    router.post(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            req.body = { ...req.body, organizationId: req.org!.id }
            if(req.user)
                req.body.userAlias = (req.user! as any).username;

            if(hooks && hooks.post && hooks.post.before) {
                req.body = await hooks.post.before(req.body, req);
            }
            const entity: TInstance = await model.create({
                ...req.body
            });
            res.send(entity);
        } catch (error) {
            next(error);
        }

    });

    router.delete(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await model.destroy({
                where: { id: req.params.id  }
            });
            res.send();
        } catch (error) {
            next(error);
        }
    });
    router.put(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if(hooks && hooks.put && hooks.put.before) {
                req.body = await hooks.put.before(req.body, req);
            }
            await model.update(req.body, {
                where: { id: req.params.id  }
            });
            res.send(req.body);
        } catch (error) {
            next(error);
        }
    });


    router.get(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const entity: TInstance | null = await model.findOne({
                where:  {
                    id: req.params.id
                }
            });

            if((entity as any).description) {
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
