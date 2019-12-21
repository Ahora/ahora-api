import { IOrganizationInstance } from "./models/organization";
import { IUserInstance } from "./models/users";

declare global {
   export namespace Express {
    export interface User extends IUserInstance  {

    } 

     export interface Request {
       org?: IOrganizationInstance;
     }
   }
 }