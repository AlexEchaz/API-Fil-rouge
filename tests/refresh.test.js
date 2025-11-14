const request = require('supertest');
const app = require('../index');

describe("REFRESH TOKEN", () => {
    let refreshToken = null;

    test("Login crée un refresh token", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: "test@example.com",
                password: "MotDePasse.1"
            });

        expect(res.statusCode).toBe(200);
        expect(res.headers["set-cookie"]).toBeDefined();

        refreshToken = res.headers["set-cookie"][0];
    });

    test("Refresh donne un nouveau access token", async () => {
        const res = await request(app)
            .post("/auth/refresh")
            .set("Cookie", refreshToken);

        expect(res.statusCode).toBe(200);
        expect(res.body.accessToken).toBeDefined();
    });

});
