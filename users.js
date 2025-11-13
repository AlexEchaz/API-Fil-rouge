const db = require('./db')
const jwt = require('jsonwebtoken');
const { hashPassword } = require('./AccessToken/passwordUtile');

// Route GET pour lister tous les utilisateurs
function getUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM USERS', (err, rows) => {
            if(err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

async function createUsers(nom, email, password) {
  try {
    const hashed = await hashPassword(password);
    return new Promise((resolve, reject) => {
      // Vérifie si l'email existe déjà
      db.get('SELECT * FROM USERS WHERE email = ?', [email], (err, row) => {
        if (err) {
          reject(err);
        } else if (row) {
          reject(new Error('Cet email est déjà utilisé'));
        } else {
          // Si l'email n'existe pas, on insère l'utilisateur
          db.run(
            'INSERT INTO USERS (nom, email, password) VALUES (?, ?, ?)',
            [nom, email, hashed],
            (err) => {
              if (err) reject(err);
              else resolve({ message: 'Utilisateur créé avec succès ✅' });
            }
          );
        }
      });
    });
  } catch (err) {
    throw new Error('Erreur lors de la création de l utilisateur');
  }
}

// Route PUT pour mettre à jour les utilisateurs
function updateUsers(id, nom, email) {
    return new Promise((resolve, reject) => {
        db.run('UPDATE USERS SET nom = (?), email = (?) where id = (?)', [nom, email, id], (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

// Route DELETE pour supprimer un utilisateur
function deleteUsers(id) {
    return new Promise((resolve, reject) => {
        db.run('DELETE FROM USERS WHERE id = (?)', id, (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
}

module.exports = {
    getUsers,
    createUsers,
    updateUsers,
    deleteUsers
};
