import Organization from "../../../../models/organization";
import User from "../../../../models/users";

export default interface ICondition {
    getFieldName(): string | any;
    generate(values: string[], organization: Organization, currentUser?: User): Promise<any>;
}