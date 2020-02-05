import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import db from "../models/index";
import { IOrganizationInstance } from "../models/organization";
import { IAttachmentsAttributes, IAttachmentsInstance } from "../models/attachments";
import storageHandler from "../storage/handlers";
import { FileAction } from "../storage/handlers/IStorageHandler";

import { v1 } from "uuid";


const generateQuery = async (req: Request): Promise<any> => {
    const currentOrg: IOrganizationInstance = req.org!;
    return { organizationId: currentOrg.id };
}

const afterPost = async (attachment: IAttachmentsInstance, req?: Request): Promise<IAttachmentsInstance> => {

    if (req && req.org) {
        const expires: number = 1000 * 60 * 60;

        const fileKey: string = `${req.org.id}/${attachment.identifier}`;
        const urlToUpload = await storageHandler.getSignedUrl(fileKey, expires, FileAction.Write, attachment.contentType);

        return {
            ...attachment as any,
            urlToUpload
        }
    }

    return attachment;
};

const beforePost = async (attachment: IAttachmentsAttributes, req?: Request): Promise<IAttachmentsAttributes> => {
    attachment.identifier = v1();
    return Promise.resolve(attachment);
};

export default (path: string) => {
    const router = routeCreate<IAttachmentsInstance, IAttachmentsAttributes>(path, db.attachments, {
        get: {
            getAdditionalParams: generateQuery,
        },
        post: {
            after: afterPost,
            before: beforePost
        }
    });

    router.post(`${path}/:id/markUploaded`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const attachment: IAttachmentsInstance | null = await db.attachments.findOne({
                where: { id: parseInt(req.params.id), organizationId: req.org!.id }
            });
            if (attachment) {
                await db.attachments.update({
                    isUploaded: true
                }, { where: { id: req.params.id } });
                res.send();
            } else {
                res.status(404).send();
            }
        } catch (error) {
            next(error);
        }
    });

    router.get(`${path}/:id/view`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const attachment: IAttachmentsInstance | null = await db.attachments.findOne({
                where: { id: parseInt(req.params.id), organizationId: req.org!.id }
            });
            if (attachment && req && req.org) {
                const expires: number = 1000 * 5;
                const fileKey: string = `${req.org.id}/${attachment.identifier}`;
                const singedUrl = await storageHandler.getSignedUrl(fileKey, expires, FileAction.Write, attachment.contentType);
                res.redirect(singedUrl);
            } else {
                res.status(404).send();
            }
        } catch (error) {
            next(error);
        }
    });
    return router;
};
