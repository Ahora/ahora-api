
export {}

export interface AhoraUser extends Express.User {
  username: string;

}

declare global {
   export namespace Express {
     export interface Request {
       user: AhoraUser | undefined;
     }
   }
 }