const db = require('./db')

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

// Route POST pour ajouter un utilisateur
function createUsers(nom, email) {
    return new Promise((resolve, reject) => {
        db.run('INSERT INTO USERS (nom, email) VALUES (?, ?)', nom, email, (err) => {
            if(err)
                reject(err);
            else
                resolve();
        });
    });
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



// Route POST pour ajouter un utilisateur
// function createUsers(nom, email) {
//   if (!nom || !email) {
//     return res.status(400).json({ error: "Champs manquants" });
//   }

//   const sql = "INSERT INTO clients (nom, email) VALUES (?, ?, ?, ?)";
//   db.query(sql, [nom, email], (err, result) => {
//     if (err) {
//       console.error("Erreur SQL :", err);
//       return res.status(500).json({ error: "Erreur ajout utilisateur" });
//     }
//     res.status(201).json({
//       id: result.insertId,
//       name: nom,
//       email : email
//     });
//   });
// };

// Route GET pour lister tous les utilisateurs
// function getUsers() {
//     db.query ('SELECT * FROM USERS', (req, res) => {
//         if (err) {
//             console.error("Erreur SQL :", err);
//             return res.status(500).send ({ error: "Erreur serveur" });
//         } else {
//         res.json(results);
//         }
//     });
// };
