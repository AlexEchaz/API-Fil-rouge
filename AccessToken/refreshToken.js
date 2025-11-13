const crypto = require('crypto');
const db = require('../db');
const bcrypt = require('bcrypt');

function generateRefreshToken() {
  // On crée un token aléatoire long et sécurisé
  return crypto.randomBytes(64).toString('hex');
}

// Sauvegarde un refresh token (version hashée)
async function saveRefreshToken(userId, refreshToken, deviceInfo = null) {
  const tokenHash = await bcrypt.hash(refreshToken, 10);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // expire dans 7 jours
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
async function verifyRefreshToken(userId, refreshToken) {
  return new Promise((resolve, reject) => {
    db.get(
      `SELECT * FROM REFRESH_TOKENS WHERE user_id = ? AND revoked = 0`,
      [userId],
      async (err, row) => {
        if (err) return reject(err);
        if (!row) return reject(new Error('Refresh token introuvable'));
        const match = await bcrypt.compare(refreshToken, row.token_hash);
        if (!match) return reject(new Error('Refresh token invalide'));
        const now = new Date();
        if (new Date(row.expires_at) < now) {
          return reject(new Error('Refresh token expiré'));
        }
        // Met à jour la dernière utilisation
        db.run(`UPDATE REFRESH_TOKENS SET last_used_at = CURRENT_TIMESTAMP WHERE id = ?`, [row.id]);
        resolve(row);
      }
    );
  });
}

// Révoque un refresh token
function revokeRefreshToken(userId) {
  return new Promise((resolve, reject) => {
    db.run(`UPDATE REFRESH_TOKENS SET revoked = 1 WHERE user_id = ?`, [userId], function (err) {
      if (err) reject(err);
      else resolve({ message: 'Refresh token révoqué' });
    });
  });
}

module.exports = {
  generateRefreshToken,
  saveRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken
};
