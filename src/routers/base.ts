import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance } from "../models/docs";
import Sequelize from "sequelize";
import marked from "marked";

export interface RouterHooks<TAttributes> {
    beforePut?(entity: TAttributes, req?: Request): Promise<TAttributes>;
    beforePost?(entity: TAttributes, req?: Request): Promise<TAttributes>;
}

export default <TInstance, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>, hooks: RouterHooks<TAttributes> | null = null) => {
    const router: Router = express.Router();
        
    router.get(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const query = { ...req.query };
            if(req.org) {
                query.organizationId = req.org.id;
            }
            const entity: TInstance[] = await model.findAll({where:  query });
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

            if(hooks && hooks.beforePost) {
                req.body = await hooks.beforePost(req.body, req);
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
                where: { id: req.params.id, organizationId: req.org!.id  }
            });
            res.send();
        } catch (error) {
            next(error);
        }
    });
    router.put(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            if(hooks && hooks.beforePut) {
                req.body = await hooks.beforePut(req.body, req);
            }
            await model.update(req.body, {
                where: { id: req.params.id, organizationId: req.org!.id   }
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
                    id: req.params.id, organizationId: req.org!.id 
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
