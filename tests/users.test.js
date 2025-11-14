// Mocker db avant l'import
jest.mock("../db", () => ({
  get: jest.fn(),
  run: jest.fn(),
  all: jest.fn(),
}));

const db = require("../db");
const { createUsers, getUsers } = require("../users");

// Mock de db.get, db.run, db.all
db.get.mockImplementation((sql, params, cb) => {
  // Si l'email existe, retourner un objet, sinon null
  if (params[0] === "test@test.com") cb(null, null); // utilisateur n’existe pas
  else cb(null, { id: 1 });
});

db.run.mockImplementation((sql, params, cb) => cb(null));

db.all.mockImplementation((sql, cb) => cb(null, [{ id: 1, email: "test@test.com" }]));

// Mock de la réponse Express
const createMockRes = () => ({
  statusCode: null,
  payload: null,
  status(code) { this.statusCode = code; return this; },
  send(payload) { this.payload = payload; return this; },
  json(payload) { this.payload = payload; return this; },
});

describe("USERS", () => {
  test("createUser fonctionne", async () => {
    const res = createMockRes();
    const nom = "Test";
    const email = "test@test.com";
    const password = "Password.123";

    const user = await createUsers(nom, email, password);
    res.status(201).json(user);

    expect(res.statusCode).toBe(201);
  });

  test("getUser renvoie user", async () => {
    const res = createMockRes();

    const users = await getUsers();
    res.status(200).json(users[0]);

    expect(res.statusCode).toBe(200);
    expect(res.payload).toHaveProperty("email", "test@test.com");
  });

  test("getUser non trouvé renvoie 404", async () => {
    const res = createMockRes();

    db.all.mockImplementationOnce((sql, cb) => cb(null, [])); // pas d'utilisateur trouvé

    const users = await getUsers();
    if (!users.length) {
      res.status(404).json({ error: "Utilisateur introuvable" });
    }

    expect(res.statusCode).toBe(404);
    expect(res.payload).toHaveProperty("error", "Utilisateur introuvable");
  });
});
