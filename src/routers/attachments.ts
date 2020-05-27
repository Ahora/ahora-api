import { Request, Response, NextFunction } from "express";
import routeCreate from "./base";
import db from "../models/index";
import Organization from "../models/organization";
import Attachment from "../models/attachments";
import storageHandler from "../storage/handlers";
import { FileAction } from "../storage/handlers/IStorageHandler";
import { URL } from "../config";

import { v4 } from "uuid";


const generateQuery = async (req: Request): Promise<any> => {
    const currentOrg: Organization = req.org!;
    return { organizationId: currentOrg.id };
}

const afterPost = async (attachment: Attachment, req?: Request): Promise<Attachment> => {

    if (req && req.org) {
        let expires = new Date();
        expires = new Date(expires.getTime() + 1000 * 60 * 60);


        const fileKey: string = `${req.org.id}/${attachment.identifier}`;
        const urlToUpload = await storageHandler.getSignedUrl(fileKey, expires, FileAction.Write, attachment.contentType);

        const returnValue: any = await afterGet(attachment, req);
        returnValue.urlToUpload = urlToUpload;
        return returnValue;
    }

    return attachment;
};

const afterGet = (attachment: Attachment, req?: Request): Promise<Attachment> => {
    return {
        id: attachment.id,
        organizationId: attachment.organizationId,
        contentType: attachment.contentType,
        filename: attachment.filename,
        identifier: attachment.identifier,
        isUploaded: attachment.isUploaded,
        viewUrl: `${URL}/api/organizations/${req && req.org && req.org.login}/attachments/${attachment.id}/view`
    } as any;
}

const beforePost = async (attachment: Attachment, req?: Request): Promise<Attachment> => {
    attachment.identifier = v4();
    attachment.organizationId = req!.org!.id;
    return Promise.resolve(attachment);
};

export default (path: string) => {
    const router = routeCreate<Attachment, Attachment>(path, Attachment, (req) => {
        return {
            get: {
                after: afterGet,
                getAdditionalParams: generateQuery,
            },
            post: {
                after: afterPost,
                before: beforePost
            }
        }
    });

    router.get(`${path}/:id/view`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const attachment: Attachment | null = await Attachment.findOne({
                where: { id: parseInt(req.params.id), organizationId: req.org!.id }
            });
            if (attachment && req && req.org) {
                let d = new Date();
                d = new Date(d.getTime() + 60000);
                const fileKey: string = `${req.org.id}/${attachment.identifier}`;
                const singedUrl = await storageHandler.getSignedUrl(fileKey, d, FileAction.Read);
                res.redirect(singedUrl);
            } else {
                res.status(404).send();
            }
        } catch (error) {
            next(error);
        }
    });

    router.post(`${path}/:id/markUploaded`, async (req: Request, res: Response, next: NextFunction) => {
        try {
            const attachment: Attachment | null = await Attachment.findOne({
                where: { id: parseInt(req.params.id), organizationId: req.org!.id }
            });
            if (attachment) {
                await Attachment.update({
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


    return router;
};
