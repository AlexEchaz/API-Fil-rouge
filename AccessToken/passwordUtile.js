const bcrypt = require('bcrypt');

// Vérifie la conformité du mot de passe (policy)
function verifyPasswordPolicy(password) {
    // Exemples de règles (tu peux les adapter à ton besoin)
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

    if (password.length < minLength)
        return { valid: false, message: `Le mot de passe doit contenir au moins ${minLength} caractères.` };
    if (!hasUpperCase)
        return { valid: false, message: 'Le mot de passe doit contenir au moins une majuscule.' };
    if (!hasLowerCase)
        return { valid: false, message: 'Le mot de passe doit contenir au moins une minuscule.' };
    if (!hasNumber)
        return { valid: false, message: 'Le mot de passe doit contenir au moins un chiffre.' };
    if (!hasSpecialChar)
        return { valid: false, message: 'Le mot de passe doit contenir au moins un caractère spécial.' };

    return { valid: true, message: 'Mot de passe valide ✅' };
}

// Hash du mot de passe
async function hashPassword(password) {
    const saltRounds = 5; // 10
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (err) {
        throw new Error('Erreur lors du hash du mot de passe');
    }
}

// Comparaison entre mot de passe en clair et hashé
async function comparePassword(password, hash) {
    try {
        const match = await bcrypt.compare(password, hash);
        return match; // true si correspondance, false sinon
    } catch (err) {
        throw new Error('Erreur lors de la comparaison du mot de passe');
    }
}

module.exports = {
    verifyPasswordPolicy,
    hashPassword,
    comparePassword
};
