import request from 'supertest';
import { app } from "./init";
import { assert } from 'chai';

describe('User', () => {
    it('Get User from mock', async (done) => {
        request(app).get("/auth/github").expect(302).end((err, res) => {
            if (err) {
                done(err)
            }
            else {
                const oauthUrl = res.header.locaiton;

            }
        })

    });

    /*
        describe('get /api/me', () => {
            it('not authorized', () => {
                return request(app)
                    .get(`/api/me`)
                    .expect(200)
                    .expect("");
            });
        });
        */
});