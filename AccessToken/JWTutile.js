const jwt = require('jsonwebtoken');
require('dotenv').config(); // pour accéder à process.env.JWT_SECRET

// Génération d'un token JWT
function createToken(payload, expiresIn = '1h') {
    try {
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
        return token;
    } catch (err) {
        throw new Error('Erreur lors de la création du token');
    }
}

// Vérification d'un token
function verifyToken(token) {
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        return decoded; // contient les infos (payload)
    } catch (err) {
        throw new Error('Token invalide ou expiré');
    }
}

// Décodage sans vérification (ne pas utiliser pour authentifier)
function decodeToken(token) {
    try {
        const decoded = jwt.decode(token);
        return decoded;
    } catch (err) {
        throw new Error('Erreur lors du décodage du token');
    }
}

module.exports = {
    createToken,
    verifyToken,
    decodeToken
};
