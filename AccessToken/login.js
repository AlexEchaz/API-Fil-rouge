const db = require('../db');
const { comparePassword } = require('./passwordUtile');
const { createToken } = require('./JWTutile');
const { generateRefreshToken, saveRefreshToken } = require('./refreshToken');

// Fonction principale : login d'un utilisateur
async function loginUser(req, res) { //async function loginUser(email, password) {
    try {
        // On récupère les champs du body
        const { email, password } = req.body;
        // Vérifie que les deux champs sont fournis
        if (!email || !password) {
            return res.status(400).json({ error: "Email et mot de passe requis" });
        }
        // Retrouver l'utilisateur par email
        const user = await getUserByEmail(email);
        if (!user) {
            return res.status(404).json({ error: "Utilisateur introuvable" });
        }
        // Vérifier le mot de passe
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: "Identifiants invalides" });
        }
        // Générer un token JWT
        const payload = { id: user.id, nom: user.nom, email: user.email };
        const accessToken = createToken(payload);
        // Crée un refresh token JWT (valable 7 jours)
        const refreshToken = generateRefreshToken(user);
        await saveRefreshToken(user.id, refreshToken, 'Postman / Localhost');

        // Envoie le refresh token en cookie HTTP-only + Secure
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true, // interdit l'accès via JS
            secure: true,   // true si HTTPS uniquement (désactive si tu testes en local sans HTTPS)
            sameSite: 'strict', // empêche le CSRF
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        // Renvoie seulement l'access token dans le body
        return res.status(200).json({
            message: "Connexion réussie",
            accessToken,
            user: {
                id: user.id,
                nom: user.nom,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Erreur de login :', err);
        return res.status(500).json({ error: err.message });
    }
}

// Helper : retrouver un utilisateur via l'email
function getUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.get("SELECT * FROM USERS WHERE email = ?", [email], (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

module.exports = {
    loginUser
};
