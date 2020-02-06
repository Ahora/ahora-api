import { Storage, Bucket, GetSignedUrlResponse } from "@google-cloud/storage";
import { IStorageHandler, FileAction } from "./IStorageHandler";
import * as http from "http";

export default class GoogleBucketHandler implements IStorageHandler {
    private googleBucket: Bucket;

    constructor(bucketName: string) {
        const storage: Storage = new Storage();
        this.googleBucket = storage.bucket(bucketName);
    }

    public async getSignedUrl(key: string, expires: number | Date, mode: FileAction, contentType?: string,
        extensionHeaders?: http.OutgoingHttpHeaders): Promise<string> {
        const t: GetSignedUrlResponse = await this.googleBucket.file(key).getSignedUrl(
            {
                action: mode,
                expires,
                contentType,
                extensionHeaders
            });
        return t[0];

    }
}