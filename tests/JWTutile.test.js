const { createToken } = require("../AccessToken/JWTutile");
const jwt = require("jsonwebtoken");

describe("JWT UTILS", () => {

    test("createToken crée un JWT valide", () => {
        const token = createToken({ id: 1, email: "test@test.com" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        expect(decoded.id).toBe(1);
        expect(decoded.email).toBe("test@test.com");
    });

});
