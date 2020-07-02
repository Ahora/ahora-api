import { Request } from "express";

export interface IGroupParameters {
    includes?: any[];
    group: string[],
    attributes?: string[] | any[],
}

export interface GroupInfo {
    criteria: string[];
}

export interface IGroupHandler {
    readonly groupable: boolean;
    handleGroup: (group: string, req: Request) => IGroupParameters;
    changeData: (row: any) => GroupInfo;
}