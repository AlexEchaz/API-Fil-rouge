const db = require('./db')
const jwt = require('jsonwebtoken');

// Route utilisateurs
function registerUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM USERS', (err, rows) => {
            if(err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

// Route GET pour lister tous les utilisateurs
function loginUsers() {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM USERS', (err, rows) => {
            if(err)
                reject(err);
            else
                resolve(rows);
        });
    });
}

module.exports = {
    getUsers
};
