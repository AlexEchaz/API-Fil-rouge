const dotenv = require('dotenv')
const express = require('express');
const app = express();
const users = require('./users');
var bodyParser = require("body-parser");

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

dotenv.config();

// GET ALL
app.get("/users", async function(req, res) {
    const allUsers = await users.getUsers();
    res.send(allUsers);
});

// POST
app.post("/users", async function(req, res) {
    const nom = req.body.nom
    const email = req.body.email
    await users.createUsers(nom, email);
    res.send({"message": "Success"});
});

// PUT
app.put("/users/:id", async function(req, res) {
    const nom = req.body.nom
    const email = req.body.email
    await users.updateUsers(nom, email);
    res.send({"message": "Success"});
});

// DELETE
app.delete("/users/:id", async function(req, res) {
    await agents.deleteUsers(req.params.id);
    res.send({"message": "Success"});
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