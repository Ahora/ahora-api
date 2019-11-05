
export {}
declare global {
   export namespace Express {
     export interface Request {
       user: any;
     }
   }
 }