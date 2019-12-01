import { IOrganizationInstance } from "./models/organization";

export {}

export interface AhoraUser extends Express.User {
  username: string;

}

declare global {
   export namespace Express {
     export interface Request {
       org?: IOrganizationInstance;
       user: AhoraUser | undefined;
     }
   }
 }