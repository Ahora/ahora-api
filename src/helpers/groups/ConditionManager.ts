import ICondition from "./docs/conditions/ICondition";

export default class ConditionManager {
    private dictionary: Map<string, ICondition>;

    constructor() {
        this.dictionary = new Map<string, ICondition>();
    }

    public registerField(field: string, handler: ICondition) {
        this.dictionary.set(field.toLowerCase(), handler);
    }

    public getField(field: string): ICondition | undefined {
        return this.dictionary.get(field.toLowerCase());
    }
}