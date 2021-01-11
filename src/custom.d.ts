import Organization from "./models/organization";
import OrganizationTeamUser from "./models/organizationTeamsUsers";
import { default as AhoraUser } from "./models/users";
import Doc from "./models/docs";
import DocSource from "./models/docSource";

declare global {
  export namespace Express {
    export interface User extends AhoraUser {
      DocSources: DocSource[]
    }

    export interface Request {
      org?: Organization;
      orgPermission?: OrganizationTeamUser;
      docSource?: DocSource;
      doc?: Doc
    }
  }
}