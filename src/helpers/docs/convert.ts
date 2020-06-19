import { SearchCriteriasByIds, SearchCriterias, getMilestonesFromStrings, getStatusesFromStrings, getDocTypesFromStrings, getLabelIdsFromStrings, getUsersFromStrings } from "./db";
import Doc from "../../models/docs";
import OrganizationNotification from "../../models/OrganizationNotifications";

export const convertSearchCriteriasToIds = async (organizationId: number, searchCriterias: SearchCriterias): Promise<SearchCriteriasByIds> => {

    const milestonePromise = getMilestonesFromStrings(organizationId, searchCriterias.milestone);
    const statusesPromise = getStatusesFromStrings(organizationId, searchCriterias.status)
    const docTypesPromise = getDocTypesFromStrings(organizationId, searchCriterias.docType)
    const labelsPromise = getLabelIdsFromStrings(organizationId, searchCriterias.label)
    const assigneePromise = getUsersFromStrings(searchCriterias.assignee);
    const reporterPromise = getUsersFromStrings(searchCriterias.reporter)
    const [milestone, status, docType, label, assignee, reporter] = await Promise.all([
        milestonePromise,
        statusesPromise,
        docTypesPromise,
        labelsPromise,
        assigneePromise,
        reporterPromise
    ]);

    return {
        milestone,
        status,
        docType,
        label,
        assignee,
        reporter,
        repo: searchCriterias.repo,
        subject: searchCriterias.subject,
        description: searchCriterias.description,
        text: searchCriterias.text
    }
}

export const checkNotificationWithDoc = async (doc: Doc, currentNotification: OrganizationNotification) => {
    const searchCriteriasByIds = await convertSearchCriteriasToIds(doc.organizationId, currentNotification.searchCriteria);

    let isValid: boolean = true;

    if (doc.assigneeUserId &&
        searchCriteriasByIds.assignee &&
        searchCriteriasByIds.assignee.indexOf(doc.assigneeUserId) === -1) {
        isValid = false
    }

    if (doc.reporterUserId &&
        searchCriteriasByIds.reporter &&
        searchCriteriasByIds.reporter.indexOf(doc.reporterUserId) === -1) {
        isValid = false
    }

    if (doc.statusId &&
        searchCriteriasByIds.status &&
        searchCriteriasByIds.status.indexOf(doc.statusId) === -1) {
        isValid = false
    }

    if (doc.docTypeId &&
        searchCriteriasByIds.docType && searchCriteriasByIds.docType.length > 0 &&
        searchCriteriasByIds.docType.indexOf(doc.docTypeId) === -1) {
        isValid = false
    }

    return isValid;
}