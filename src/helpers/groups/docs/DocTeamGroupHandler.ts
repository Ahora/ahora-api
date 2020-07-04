import { IGroupHandler, IGroupParameters, GroupInfo } from "../IGroupHandler";
import DocLabel from "../../../models/docLabel";
import Label from "../../../models/labels";
import User from "../../../models/users";
import OrganizationTeamUser from "../../../models/organizationTeamsUsers";
import OrganizationTeam from "../../../models/organizationTeams";

export default class DocTeamGroupHandler implements IGroupHandler {
    public readonly groupable: boolean;

    constructor() {
        this.groupable = true;
    };


    public handleGroup(group: string): IGroupParameters {
        return {
            group: ["\"reporter->OrganizationTeamUsers->OrganizationTeam\".\"name\""],
            includes: [
                {
                    as: "reporter",
                    model: User,
                    attributes: [],
                    include: {
                        raw: true,
                        model: OrganizationTeamUser,
                        attributes: [],
                        include: {
                            raw: true,
                            model: OrganizationTeam,
                            attributes: ["name"]
                        }
                    }
                }]
        }
    }

    public changeData(row: any): GroupInfo {
        const val = row["reporter.OrganizationTeamUsers.OrganizationTeam.name"];
        return {
            criteria: (val === null) ? "null" : val
        }
    }
}