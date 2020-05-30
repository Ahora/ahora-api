import { initAssociationAttachments } from "./attachments"
import { initAssociationComments } from "./comments";
import { initAssociationDocLabel } from "./docLabel";
import { initAssociationDocSource } from "./docSource";
import { initAssociationDocSourceLabel } from "./docsourcelabel";
import { initAssociationDocSourceMilestone } from "./docsourcemilestone";
import { initAssociationDocType } from "./docType";
import { initAssociationDocUserView } from "./docUserView";
import { initAssociationDocWatcher } from "./docWatcher";
import { initAssociationDocs } from "./docs";
import { initAssociationLabel } from "./labels";
import { initAssociationOrganization } from "./organization";
import { initAssociationOrganizationDashboard } from "./organizationDashboards";
import { initAssociationOrganizationMilestone } from "./milestones";
import { initAssociationOrganizationStatus } from "./docStatuses";
import { initAssociationOrganizationTeams } from "./organizationTeams";
import { initAssociationOrganizationTeamsUsers } from "./organizationTeamsUsers";
import { initAssociationUser } from "./users";

export default () => {
    initAssociationAttachments();
    initAssociationComments();
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
    initAssociationOrganizationDashboard();
    initAssociationOrganizationMilestone();
    initAssociationOrganizationStatus();
    initAssociationOrganizationTeams();
    initAssociationOrganizationTeamsUsers();
    initAssociationUser();
}