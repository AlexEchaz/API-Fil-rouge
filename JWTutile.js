// décode (récupère data)
// verify (check)
const dotenv = require('dotenv')
var bodyParser = require("body-parser");
const jwt = require('jsonwebtoken');

require('dotenv').config();

// encode (créer token)
function generateToken(user) {
   return jwt.sign({ id: user.id, nom: user.nom, email: user.email }, process.env.TOKEN_SECRET, { expiresIn: '1h' });
}