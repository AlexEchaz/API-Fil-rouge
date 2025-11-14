process.env.JWT_SECRET = 'testsecret';

const authenticateToken = require("../middleware/verifyToken");
const jwt = require("jsonwebtoken");

const createMockRes = () => {
  return {
    statusCode: null,
    payload: null,
    status(code) { this.statusCode = code; return this; },
    send(payload) { this.payload = payload; return this; },
    json(payload) { this.payload = payload; return this; }
  };
};

describe("AUTH MIDDLEWARE", () => {

    test("Doit renvoyer 401 si pas de token", () => {
        const req = { headers: {} };
        const res = createMockRes();
        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(res.statusCode).toBe(401);
        expect(next).not.toHaveBeenCalled();
    });

    test("Doit accepter un token valide", () => {
        const token = jwt.sign({ id: 1 }, process.env.JWT_SECRET);

        const req = { headers: { authorization: `Bearer ${token}` } };
        const res = {};
        const next = jest.fn();

        authenticateToken(req, res, next);

        expect(next).toHaveBeenCalled();
    });

});
