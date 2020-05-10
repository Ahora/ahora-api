import { IGroupHandler } from "./IGroupHandler";

export default class GroupByManager {
    private dictionary: Map<string, IGroupHandler>;

    constructor() {
        this.dictionary = new Map<string, IGroupHandler>();
    }

    public registerGroup(group: string, handler: IGroupHandler) {
        this.dictionary.set(group.toLowerCase(), handler);
    }

    public getGroup(group: string): IGroupHandler | undefined {
        return this.dictionary.get(group.toLowerCase());
    }
}