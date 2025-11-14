const { hashPassword, comparePassword, verifyPasswordPolicy } =
    require("../AccessToken/passwordUtile");

describe("PASSWORD UTILS", () => {

    test("Hash et compare doivent fonctionner", async () => {
        const pwd = "Password.123";

        const hash = await hashPassword(pwd);
        expect(hash).toBeDefined();

        const valid = await comparePassword(pwd, hash);
        expect(valid).toBe(true);
    });

    test("verifyPasswordPolicy valide un bon mot de passe", () => {
        const { valid } = verifyPasswordPolicy("Password.123");
        expect(valid).toBe(true);
    });

    test("verifyPasswordPolicy invalide un mauvais mot de passe", () => {
        const { valid } = verifyPasswordPolicy("abc");
        expect(valid).toBe(false);
    });
});
