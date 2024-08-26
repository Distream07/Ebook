const express = require('express');
const { MongoClient, ServerApiVersion } = require('mongodb');
const path = require('path');

const app = express();
const port = 3000;

// MongoDB URI
const mongoURI = 'mongodb+srv://distream07:97hnVf1LgK2JZOl4@cluster0.bn3vv.mongodb.net/Collection?retryWrites=true&w=majority&appName=Cluster0';
const client = new MongoClient(mongoURI, {
    serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
    }
});

// Middleware pour permettre les requêtes CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Servir les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route pour obtenir les eBooks
app.get('/api/ebooks', async (req, res) => {
    try {
        await client.connect();
        const db = client.db('Collection');
        const ebooks = await db.collection('AllScan').find().toArray();
        res.json(ebooks);
    } catch (err) {
        res.status(500).json({ error: 'Erreur lors de la récupération des eBooks' });
    } finally {
        await client.close();
    }
});

// Route pour obtenir un eBook spécifique
const { ObjectId } = require('mongodb'); // Assurez-vous d'importer ObjectId

app.get('/api/ebooks/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await client.connect();
        const db = client.db('Collection');
        const ebook = await db.collection('AllScan').findOne({ _id: new ObjectId(id) }); // Utilisation correcte de ObjectId
        if (ebook) {
            res.json(ebook);
        } else {
            res.status(404).json({ error: 'eBook non trouvé' });
        }
    } catch (err) {
        console.error('Erreur lors de la récupération de l\'eBook:', err);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'eBook' });
    } finally {
        await client.close();
    }
});


// Route pour la page d'accueil des eBooks
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'html', 'ebook.html'));
});

// Écoute du serveur
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
