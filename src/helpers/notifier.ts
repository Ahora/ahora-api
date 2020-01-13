import { IUserInstance } from "../models/users";
import { IDocInstance } from "../models/docs";
import db from "../models";
import { DocWatcherType } from "../models/docWatcher";
import { SEND_GRID_SECRET, EMAIL_DOMAIN } from "../config";
import { ICommentInstance } from "../models/comments";

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(SEND_GRID_SECRET);

interface NotificationUser {
    id: number,
    userId: number,
    user: {
        username: string,
        displayName: string,
        email: string
    }
}

export const notifyComment = async (user: IUserInstance, doc: IDocInstance, comment: ICommentInstance): Promise<void> => {
    let watchers: NotificationUser[] = await db.docWatchers.findAll({
        where: {
            docId: doc.id,
            watcherType: DocWatcherType.Watcher //return only watchers!
        },
        attributes: ["id", "userId"],
        include: [{ model: db.users, attributes: ["displayName", "username", "email"] }]
    }) as any;

    // Remove current user email address
    //watchers = watchers.filter((watcher) => watcher.userId !== user.id && user.email);

    const emails = watchers.map((watcher) => watcher.user.email);
    const msg = {
        from: `${user.displayName || user.username} (Ahora) <${doc.id}-${comment.id}-comment@${EMAIL_DOMAIN}>`,
        to: emails,
        templateId: 'd-8b18787f0f5c47339cd670bfb1c6a6b5',
        dynamic_template_data: { user, doc, comment },
    };
    await sgMail.send(msg).catch((error: any) => {
        console.error(error.response.body);
    });
}
