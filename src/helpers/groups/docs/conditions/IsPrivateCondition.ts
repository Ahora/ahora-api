import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class IsPrivateCondition implements ICondition {
    getFieldName(): string {
        return "isPrivate";
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        return values[0] === "true"
    }
}