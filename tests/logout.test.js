const request = require("supertest");
const app = require("../app");

describe("LOGOUT", () => {

    let accessToken = null;

    beforeAll(async () => {
        await request(app).post("/auth/signup").send({
            nom: "LogoutTest",
            email: "logout@test.com",
            password: "Password.123"
        });

        const res = await request(app).post("/auth/login").send({
            email: "logout@test.com",
            password: "Password.123"
        });

        accessToken = res.body.accessToken;
    });

    test("Logout supprime le cookie", async () => {
        const res = await request(app)
            .post("/auth/logout")
            .set("Authorization", `Bearer ${accessToken}`);

        expect(res.statusCode).toBe(200);
        expect(res.body.message).toContain("Déconnexion réussie");
    });

});
