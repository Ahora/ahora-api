import Organization from "./models/organization";
import OrganizationTeamUser from "./models/organizationTeamsUsers";
import { default as AhoraUser } from "./models/users";

declare global {
  export namespace Express {
    export interface User extends AhoraUser {

    }

    export interface Request {
      org?: Organization;
      orgPermission?: OrganizationTeamUser;
    }
  }
}