import User from "../models/users";
import Doc from "../models/docs";
import db from "../models";
import DocWatcher, { DocWatcherType } from "../models/docWatcher";
import { SEND_GRID_SECRET, EMAIL_DOMAIN, URL } from "../config";
import Comment from "../models/comments";
import Organization from "../models/organization";

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SEND_GRID_SECRET);

interface NotificationUser {
    id: number,
    userId: number,
    watcher: {
        username: string,
        displayName: string,
        email: string
    }
}

export const notifyComment = async (user: User, doc: Doc, comment: Comment, organization: Organization): Promise<void> => {
    if (SEND_GRID_SECRET) {
        let watchers: NotificationUser[] = await DocWatcher.findAll({
            where: {
                docId: doc.id,
                watcherType: DocWatcherType.Watcher //return only watchers!
            },
            attributes: ["id", "userId"],
            include: [{ model: User, attributes: ["displayName", "username", "email"], as: "watcher" }]
        }) as any;

        // Remove current user email address
        watchers = watchers.filter((watcher) => watcher.userId !== user.id && user.email);

        if (watchers.length > 0) {
            const emails = watchers.map((watcher) => watcher.user.email);
            const msg = {
                from: `${user.displayName || user.username} (Ahora) <${doc.id}-${comment.id}-comment@${EMAIL_DOMAIN}>`,
                to: emails,
                templateId: 'd-8b18787f0f5c47339cd670bfb1c6a6b5',
                dynamic_template_data: { user, doc, comment, organization, url: URL },
            };
            /*await sgMail.send(msg).catch((error: any) => {
                console.error(error.response.body);
            });
            */
        }
    }
}
