// On utilise une Map pour stocker les données en RAM
const cache = new Map();

/**
 * Met une donnée en cache
 * @param {string} key - Clé unique
 * @param {*} value - Donnée à stocker
 * @param {number} ttl - Durée de vie en ms (Time To Live)
 */
function setCache(key, value, ttl = 60 * 1000) { // par défaut : 1 minute
  const expiresAt = Date.now() + ttl;
  cache.set(key, { value, expiresAt });
}

/**
 * Récupère une donnée depuis le cache
 * @param {string} key - Clé unique
 * @returns {*} Donnée si trouvée et valide, sinon null
 */
function getCache(key) {
  const cached = cache.get(key);
  if (!cached) return null;
  if (Date.now() > cached.expiresAt) {
    cache.delete(key); // Expiré → suppression automatique
    return null;
  }
  return cached.value;
}

// Supprime une clé du cache
function deleteCache(key) {
  cache.delete(key);
}

//Vide tout le cache
function clearCache() {
  cache.clear();
}

module.exports = { setCache, getCache, deleteCache, clearCache };
