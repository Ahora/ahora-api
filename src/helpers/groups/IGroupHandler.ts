export interface IGroupParameters {
    includes?: any[];
    group: string[],
    attributes?: string[] | any[],
}

export interface GroupInfo {
    criteria: string[];
}

export interface IGroupHandler {
    handleGroup: (group: string) => IGroupParameters;
    changeData: (row: any) => GroupInfo;
}