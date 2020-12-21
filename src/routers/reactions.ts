import routeCreate from "./base";
import Reaction from "../models/reactions";

export default <TInstance extends TAttributes, TAttributes, TCreationAttributes = TAttributes>(path: string) => {
    const router = routeCreate<TInstance, TAttributes, TCreationAttributes>(path, Reaction, (req) => {
        return {
            get: { useOnlyAdditionalParams: true, order: [["order", "ASC"]], attributes: ["id", "content"] },
            post: { disable: true },
            put: { disable: true },
            delete: { disable: true }
        }
    });
    return router;
};
