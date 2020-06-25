import Organization from "./models/organization";
import OrganizationTeamUser from "./models/organizationTeamsUsers";
import { default as AhoraUser } from "./models/users";
import Doc from "./models/docs";

declare global {
  export namespace Express {
    export interface User extends AhoraUser {

    }

    export interface Request {
      org?: Organization;
      orgPermission?: OrganizationTeamUser;
      doc?: Doc
    }
  }
}