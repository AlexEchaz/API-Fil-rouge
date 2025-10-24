const dotenv = require('dotenv')
const express = require('express');
const app = express();
const users = require('./users');
var bodyParser = require("body-parser");
const db = require('./db');
const jwt = require('jsonwebtoken');
const authenticateToken = require('./verifyToken');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(express.json());

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
app.post('/auth/login', async (req, res) => {
  try {
    const { nom, email, password } = req.body;
    const result = await users.registerUser(nom, email, password);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
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

// Rafraîchisement du token
app.post('/auth/refresh', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await users.loginUser(email, password);
    res.json(result);
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

// Inscription
app.post('/auth/signup', async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await users.loginUser(email, password);
    res.json(result);
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

// Lancement du serveur
// app.listen("3000", () => {
//     console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
//     console.log("db host ="+ process.env.DB_HOST)
// });

app.listen(process.env.PORT || 3000,function(req,res){
    console.log(`Serveur en cours d'exécution sur http://localhost:${3000}`);
});