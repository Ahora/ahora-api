import express, { Router, Request, Response, NextFunction } from "express";
import { IDocInstance } from "../models/docs";
import Sequelize from "sequelize";

export default <TInstance, TAttributes, TCreationAttributes = TAttributes>(path: string, model: Sequelize.Model<TInstance, TAttributes, TCreationAttributes>) => {
    const router: Router = express.Router();
        
    router.get(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const videos: TInstance[] = await model.findAll({
                where:  { ...req.query, ...req.params  }
            });
            res.send(videos);
        } catch (error) {
            next(error);
        }
    });

    router.post(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const event: TInstance = await model.create({
                ...req.body,
                ...req.params
            });
            res.send(event);
        } catch (error) {
            next(error);
        }

    });

    router.delete(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await model.destroy({
                where: { id: req.params.id, ...req.params }
            });
            res.send();
        } catch (error) {
            next(error);
        }
    });
    router.put(path, async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            await model.update(req.body, {
                where: { id: req.params.id, ...req.params  }
            });
            res.send();
        } catch (error) {
            next(error);
        }
    });


    router.get(path + "/:id", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const entity: TInstance | null = await model.findOne({
                where:  {
                    id: req.params.id, ...req.params 
                }
            });
            res.send(entity);
        } catch (error) {
            next(error);
        }
    });

    return router;
}
