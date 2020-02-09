import * as http from "http";

export enum FileAction {
    Read = "read",
    Write = "write"
}

export interface IStorageHandler {
    getSignedUrl(key: string, expires: number | Date, mode: FileAction, contentType?: string,
        extensionHeaders?: http.OutgoingHttpHeaders): Promise<string>;
}