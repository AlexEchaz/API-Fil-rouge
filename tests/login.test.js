// Mocker db avant l'import
jest.mock("../db", () => ({
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn(),
}));

const db = require("../db");
const { loginUser } = require("../AccessToken/login");
const passwordUtil = require("../AccessToken/passwordUtile");
const jwt = require("jsonwebtoken");

// Mock de jsonwebtoken
jest.mock("jsonwebtoken", () => ({
  sign: jest.fn(() => "mockedAccessToken"),
}));

// Mock de db.get pour renvoyer une promesse
db.get.mockImplementation((sql, params) => {
  if (params[0] === "test@test.com") {
    return Promise.resolve({
      id: 1,
      password: "$2b$10$hash",
      nom: "Test",
      email: "test@test.com",
    });
  } else {
    return Promise.resolve(null);
  }
});

// Mock de la réponse Express
const createMockRes = () => ({
  statusCode: null,
  payload: null,
  status(code) { this.statusCode = code; return this; },
  send(payload) { this.payload = payload; return this; },
  json(payload) { this.payload = payload; return this; },
});

describe("LOGIN", () => {

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test("login réussi renvoie 200 et accessToken", async () => {
    const req = { body: { email: "test@test.com", password: "Password.123" } };
    const res = createMockRes();

    // Mock comparePassword pour réussir
    jest.spyOn(passwordUtil, "comparePassword").mockResolvedValue(true);

    await loginUser(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.payload).toHaveProperty("accessToken", "mockedAccessToken");
  });

  test("email non trouvé renvoie 404", async () => {
    const req = { body: { email: "nouser@test.com", password: "Password.123" } };
    const res = createMockRes();

    // Pas besoin de mock comparePassword car l'utilisateur n'existe pas
    await loginUser(req, res);

    expect(res.statusCode).toBe(404);
    expect(res.payload).toHaveProperty("error", "Utilisateur introuvable");
  });

  test("mot de passe incorrect renvoie 401", async () => {
    const req = { body: { email: "test@test.com", password: "wrongpass" } };
    const res = createMockRes();

    // Mock comparePassword pour échouer
    jest.spyOn(passwordUtil, "comparePassword").mockResolvedValue(false);

    await loginUser(req, res);

    expect(res.statusCode).toBe(401);
    expect(res.payload).toHaveProperty("error", "Identifiants invalides");
  }, 10000); // Timeout 10s au cas où
});
