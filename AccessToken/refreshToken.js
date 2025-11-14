const crypto = require('crypto');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const db = require('../db');
const bcrypt = require('bcrypt');

// Génère un refresh token JWT (valable 7 jours)
function generateRefreshToken(user) {
  const payload = { id: user.id, email: user.email };
  const token = jwt.sign(payload, process.env.REFRESH_SECRET, { expiresIn: '8h' });
  return token;
}

// Sauvegarde un refresh token (version hashée)
async function saveRefreshToken(userId, refreshToken, deviceInfo = null) {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + 8 * 60 * 60 * 1000).toISOString();
  return new Promise((resolve, reject) => {
    db.run(
      `INSERT INTO REFRESH_TOKENS (user_id, token_hash, device_info, expires_at)
       VALUES (?, ?, ?, ?)`,
      [userId, tokenHash, deviceInfo, expiresAt],
      function (err) {
        if (err) reject(err);
        else resolve({ message: 'Refresh token sauvegardé', id: this.lastID });
      }
    );
  });
}

// Vérifie si un refresh token est valide
async function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.REFRESH_SECRET);
    return decoded; // contient id + email
  } catch (err) {
    throw new Error('Refresh token invalide ou expiré');
  }
}

// Révoque un refresh token spécifique
async function revokeRefreshToken(refreshToken) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE REFRESH_TOKENS SET revoked = 1 WHERE token_hash = ?`,
      [refreshToken],
      function (err) {
        if (err) reject(err);
        else resolve({ message: 'Refresh token révoqué' });
      }
    );
  });
}

// Logout : révoque un refresh token et le supprime du cookie
async function logoutUser(userId, refreshToken) {
  return new Promise((resolve, reject) => {
    db.run(
      `UPDATE REFRESH_TOKENS SET revoked = 1 WHERE user_id = ?`,
      [userId],
      function (err) {
        if (err) reject(err);
        else resolve({ message: 'Refresh token révoqué' });
      }
    );
  });
}

async function revokeRefreshTokenByUserId(userId) {
  return new Promise((resolve, reject) => {
    db.run(
      `DELETE FROM REFRESH_TOKENS WHERE user_id = ?`,
      [userId],
      function (err) {
        if (err) reject(err);
        else resolve({ message: "Refresh token supprimé en base" });
      }
    );
  });
}


module.exports = {
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  revokeRefreshTokenByUserId,
  logoutUser
};
