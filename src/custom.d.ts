import { IOrganizationInstance } from "./models/organization";

export {}

export interface User {
  username: string;

}

declare global {
   export namespace Express {
     export interface Request {
       org?: IOrganizationInstance;
       user?: User;
     }
   }
 }