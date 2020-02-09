import { IStorageHandler } from "./IStorageHandler"
import GoogleBucketHandler from "./GoogleBucketHandler"
import { STORAGE_BUCKET_NAME } from "../../config"

const storageHandler: IStorageHandler = new GoogleBucketHandler(STORAGE_BUCKET_NAME)

export default storageHandler;