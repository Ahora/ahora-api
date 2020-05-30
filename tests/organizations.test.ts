import request from 'supertest';
import { app } from "./init";
import { assert } from 'chai';
import Organization from '../src/models/organization';

describe('Organizations', () => {
    describe('get /api/organizations', () => {
        it('check 200', () => {
            return request(app)
                .get(`/api/organizations`)
                .expect(200);
        });
    });

    describe('get /api/organizations/:organizationId', () => {
        it('check 200', () => {
            return request(app)
                .get(`/api/organizations/ahora`).
                expect((res) => {
                    const org: Organization = res.body;
                    assert(org.login, "ahora");
                    assert(org.displayName, "Ahora");
                })
                .expect(200);
        });
    });
});