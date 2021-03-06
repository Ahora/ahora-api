import { initAssociationAttachments } from "./attachments"
import { initAssociationComments } from "./comments";
import { initAssociationDocLabel } from "./docLabel";
import { initAssociationDocSource } from "./docSource";
import { initAssociationDocSourceLabel } from "./docsourcelabel";
import { initAssociationDocSourceMilestone } from "./docsourcemilestone";
import DocType, { initAssociationDocType } from "./docType";
import { initAssociationDocUserView } from "./docUserView";
import { initAssociationDocWatcher } from "./docWatcher";
import { initAssociationDocs } from "./docs";
import { initAssociationLabel } from "./labels";
import Organization, { initAssociationOrganization } from "./organization";
import { initAssociationOrganizationDashboard } from "./organizationDashboards";
import { initAssociationOrganizationMilestone } from "./milestones";
import OrganizationStatus, { initAssociationOrganizationStatus } from "./docStatuses";
import { initAssociationOrganizationTeams } from "./organizationTeams";
import { initAssociationOrganizationTeamsUsers } from "./organizationTeamsUsers";
import { initAssociationUser } from "./users";
import { initAssociationOrganizationNotification } from "./OrganizationNotifications";
import db from ".";
import { initAssociationMentions } from "./mention";
import { initAssociationOrganizationShortcut } from "./OrganizationShortcut";
import Reaction, { initAssociationReaction } from "./reactions";
import { initAssociationCommentReactions } from "./commentReactions";
import { initAssociationUserSources } from "./userSource";

export default () => {
    initAssociationReaction()
    initAssociationAttachments();
    initAssociationComments();
    initAssociationCommentReactions();
    initAssociationDocLabel();
    initAssociationDocSource();
    initAssociationDocSourceLabel();
    initAssociationDocSourceMilestone();
    initAssociationDocType();
    initAssociationDocUserView();
    initAssociationDocWatcher();
    initAssociationDocs();
    initAssociationLabel();
    initAssociationOrganization();
    initAssociationOrganizationNotification()
    initAssociationOrganizationDashboard();
    initAssociationOrganizationMilestone();
    initAssociationOrganizationStatus();
    initAssociationOrganizationTeams();
    initAssociationOrganizationTeamsUsers();
    initAssociationUser();
    initAssociationMentions();
    initAssociationOrganizationShortcut();
    initAssociationOrganizationShortcut();
    initAssociationUserSources();

    //forceInit();
}

export const forceInit = async () => {
    await db.sequelize.sync({ force: true });

    await DocType.bulkCreate([
        {
            name: "Issue",
            code: "issue",
            hideFromSelection: true
        },
        {
            name: "PullRequest",
            code: "pr",
            hideFromSelection: true
        },
        {
            name: "Discussion",
            code: "discussion"
        },
        {
            name: "Meeting Summary",
            code: "meetingsummary"
        },
        {
            name: "Wiki",
            code: "wiki"
        },
        {
            name: "Demo",
            code: "demo"
        }
    ]);
    console.log("doc types created");

    await OrganizationStatus.bulkCreate([
        {
            name: "open"
        },
        {
            name: "closed",
            updateCloseTime: true
        },
        {
            name: "merged",
            updateCloseTime: true,
            hideFromSelection: true
        },
        {
            name: "draft",
            hideFromSelection: true
        }
    ]);

    await Reaction.bulkCreate([
        {
            content: "+1",
        },
        {
            content: "-1",
        },
        {
            content: "laugh",
        },
        {
            content: "confused"
        },
        {
            content: "heart"
        },
        {
            content: "hooray"
        },
        {
            content: "rocket"
        },
        {
            content: "eyes"
        }
    ]);
    console.log("organization status created");
}