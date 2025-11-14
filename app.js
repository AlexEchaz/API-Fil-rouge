const dotenv = require('dotenv')
const express = require('express');
const app = express();
const users = require('./users');
const bodyParser = require('body-parser');
const db = require('./db');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./middleware/verifyToken');
const login = require('./AccessToken/login');
const { verifyRefreshToken } = require('./AccessToken/refreshToken');
const { createToken } = require('./AccessToken/JWTutile');
const { logoutUser } = require('./AccessToken/refreshToken');
const { revokeRefreshToken } = require('./AccessToken/refreshToken');
const { revokeRefreshTokenByUserId } = require('./AccessToken/refreshToken');
const { comparePassword, hashPassword } = require('./AccessToken/passwordUtile');
const { getCache, setCache } = require('./utils/cache');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

dotenv.config();

// Cache
app.get("/users", authenticateToken, async function(req, res) {
  try {
    // Vérifie si les données sont déjà en cache
    const cachedUsers = getCache("all_users");
    if (cachedUsers) {
      console.log("Données récupérées depuis le cache !");
      return res.status(200).json(cachedUsers);
    }
    // Sinon, on interroge la DB
    console.log("[DB] Lecture depuis la base de données...");
    const allUsers = await users.getUsers();
    // Et on met le résultat en cache pour 30 secondes
    setCache("all_users", allUsers, 30 * 1000);
    res.status(200).json(allUsers);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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

// Route de déconnexion (logout) (révocation + suppression du cookie)
app.post('/auth/logout', authenticateToken, async (req, res) => {
  try {
    //const refreshToken = req.cookies.refreshToken;
    const userId = req.user.id;  // récupéré via l'access token JWT
    // Aucune session active
    if (!userId) { //if (!refreshToken) {
      return res.status(400).json({ error: "Aucun refresh token trouvé" });
    }
    // Révoque le token dans la BDD
    //await revokeRefreshToken(refreshToken);
    await revokeRefreshTokenByUserId(userId);
    // Supprime le cookie côté client
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: false,  // à mettre à true en HTTPS
      sameSite: 'strict'
    });
    return res.status(200).json({ message: "Déconnexion réussie" });
  } catch (error) {
    console.error("Erreur logout :", error);
    return res.status(500).json({ error: error.message });
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
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(401).json({ error: 'Aucun refresh token trouvé' });
    }
    // Vérifie le refresh token JWT
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_SECRET);
    // Regénère un nouveau access token
    const newAccessToken = createToken({
      id: decoded.id,
      email: decoded.email
    });
    res.status(200).json({
      message: "Nouveau token généré",
      accessToken: newAccessToken
    });
  } catch (err) {
    res.status(403).json({ error: err.message });
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

app.post('/auth/password-change', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.id; // récupéré depuis le token (verifyToken)
    const { oldPassword, newPassword } = req.body;
    // Vérification des champs
    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: "Les champs oldPassword et newPassword sont requis" });
    }
    // Récupérer l'utilisateur en base
    const user = await new Promise((resolve, reject) => {
      db.get("SELECT * FROM USERS WHERE id = ?", [userId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
    if (!user) return res.status(404).json({ error: "Utilisateur introuvable" });
    // Vérifier que l'ancien mot de passe est correct
    const isValid = await comparePassword(oldPassword, user.password);
    if (!isValid) {
      return res.status(401).json({ error: "Ancien mot de passe incorrect" });
    }
    // Vérifier la conformité du nouveau mot de passe
    const { valid, message } = require('./AccessToken/passwordUtile').verifyPasswordPolicy(newPassword);
    if (!valid) {
      return res.status(400).json({ error: message });
    }
    // Hasher et mettre à jour le nouveau mot de passe
    const newHash = await hashPassword(newPassword);
    await new Promise((resolve, reject) => {
      db.run("UPDATE USERS SET password = ? WHERE id = ?", [newHash, userId], (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    res.status(200).json({ message: "Mot de passe modifié avec succès" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;   // <--- essentiel pour les tests
