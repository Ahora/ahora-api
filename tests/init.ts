import { expressApp, server } from "../src/www";
import oauthServer from "./helper/authmock";

let serverAuthMock: any;

beforeAll(() => {
    serverAuthMock = oauthServer();
})

export const app = expressApp;

afterAll(() => {
    server.close();
    serverAuthMock.close();
})