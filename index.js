const app = require('./app');

// Route principale (tu peux la laisser dans index.js ou la déplacer dans app.js)
app.get('/', (req, res) => {
    res.send('Hello, Express.js!');
});

// On démarre le serveur uniquement si ce fichier est exécuté directement
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Serveur en cours d'exécution sur http://localhost:${PORT}`);
    });
}

module.exports = app; // <-- utile pour Jest
