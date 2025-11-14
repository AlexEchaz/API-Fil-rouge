const request = require("supertest");
const app = require("../app");

describe("AUTH Tests", () => {
    let emailUnique = "test" + Date.now() + "@test.com";

    test("Signup OK", async () => {
        const res = await request(app)
            .post("/auth/signup")
            .send({
                nom: "TestUser",
                email: emailUnique,
                password: "Password.123"
            });

        expect(res.statusCode).toBe(201);
    });

    test("Login OK", async () => {
        const res = await request(app)
            .post("/auth/login")
            .send({
                email: emailUnique,
                password: "Password.123"
            });

        expect(res.statusCode).toBe(200);
        expect(res.body.accessToken).toBeDefined();
    });
});
