const dotenv = require('dotenv')
const express = require('express');
const app = express();
const users = require('./users');
const bodyParser = require('body-parser');
const db = require('./db');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/verifyToken');
//const express = require('express');
const login = require('./AccessToken/login');
const { verifyRefreshToken } = require('./AccessToken/refreshToken');
const { createToken } = require('./AccessToken/JWTutile');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

const cookieParser = require('cookie-parser');
app.use(cookieParser());

dotenv.config();

// GET ALL
app.get("/users", authenticateToken, async function(req, res) {
    const allUsers = await users.getUsers();
    res.send(allUsers);
});

// POST
app.post("/users", authenticateToken, async function(req, res) {
    const nom = req.body.nom
    const email = req.body.email
    await users.createUsers(nom, email);
    res.send({"message": "Success"});
});

// PUT
app.put("/users/:id", authenticateToken, async function(req, res) {
    const nom = req.body.nom
    const email = req.body.email
    await users.updateUsers(nom, email);
    res.send({"message": "Success"});
});

// DELETE
app.delete("/users/:id", authenticateToken, async function(req, res) {
    await users.deleteUsers(req.params.id);
    res.send({"message": "Success"});
});

// Route de connexion (login)
app.post('/auth/login', (req, res) => {
  login.loginUser(req, res);
});

// Route de déconnexion (logout)
app.post('/auth/logout', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await users.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

app.post('/auth/signup', async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    if (!nom || !email || !password) {
      return res.status(400).json({ error: "Nom, email et mot de passe requis" });
    }
    // Vérifie la conformité du mot de passe
    const { valid, message } = require('./AccessToken/passwordUtile').verifyPasswordPolicy(password);
    if (!valid) {
      return res.status(400).json({ error: message });
    }
    // Crée l'utilisateur avec mot de passe hashé
    const result = await users.createUsers(nom, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Rafraîchisement du token
app.post('/auth/refresh', async (req, res) => {
  try {
    const { userId, refreshToken } = req.body;
    if (!userId || !refreshToken) {
      return res.status(400).json({ error: 'Paramètres manquants' });
    }
    // Vérifie que le refresh token est valide
    await verifyRefreshToken(userId, refreshToken);
    // Génère un nouveau access token
    const user = await new Promise((resolve, reject) => {
      db.get('SELECT * FROM USERS WHERE id = ?', [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });

    const newAccessToken = createToken({ id: user.id, nom: user.nom, email: user.email });
    res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Mot de passe oublié / reset
app.post('/auth/password-reset', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await users.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Route principale
app.get('/', (req, res) => {
    res.send('Hello, Express.js!');
});

app.listen(process.env.PORT || 3000,function(req,res){
    console.log(`Serveur en cours d'exécution sur http://localhost:${3000}`);
});
