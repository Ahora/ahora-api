import Organization from "../../../../models/organization";
import User from "../../../../models/users";
import ICondition from "./ICondition";

export default class IsPrivateCondition implements ICondition {
    getFieldName(): string {
        return "isPrivate";
    }

    async generate(values: string[], organization: Organization, currentUser?: User): Promise<any> {
        switch (values[0]) {
            case "true":
                return true;
            case "false":
                return false;
            default:
                return [true, false]
        }
    }
}