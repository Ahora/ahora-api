import OrganizationNotification from "../../models/OrganizationNotifications";
import Doc from "../../models/docs";
import { checkNotificationWithDoc } from "./convert";
import User from "../../models/users";

export const loadOrgNoptifications = async (organizationId: number) => {
    const notifications: OrganizationNotification[] = await OrganizationNotification.findAll({
        where: { organizationId: organizationId },
        include: [{ model: User, as: "owner" }]
    });

    return notifications;
}

export const runNotifications = async (doc: Doc) => {
    const notifications: OrganizationNotification[] = await loadOrgNoptifications(doc.organizationId);
    const matchedNotifications = notifications.filter((notification) => checkNotificationWithDoc(doc, notification));



} 