document.addEventListener('DOMContentLoaded', () => {
    const latestGalleryList = document.getElementById('latestGalleryItems');
    const allGalleryList = document.getElementById('allGalleryItems');
    const searchButton = document.getElementById('searchButton');
    const searchInput = document.getElementById('searchInput');
    let ebooks = [];

    // Fonction pour récupérer les eBooks
    function fetchEbooks() {
        fetch('/api/ebooks')
            .then(response => response.json())
            .then(data => {
                ebooks = data;
                displayEbooks(ebooks);
            })
            .catch(error => console.error('Erreur lors de la récupération des eBooks:', error));
    }

// Fonction pour afficher les eBooks avec les 4 dernières galeries séparées
function displayEbooks(filteredEbooks) {
    latestGalleryList.innerHTML = ''; // Réinitialise la section des 4 dernières galeries
    allGalleryList.innerHTML = ''; // Réinitialise la section des autres galeries

    // Extraire les noms uniques des galeries
    const galleries = Array.from(new Set(filteredEbooks.map(ebook => ebook.Name.split('Chapitre')[0])));

    // Séparer les 4 derniers eBooks (peu importe le chapitre)
    const latestGalleries = filteredEbooks.slice(-4); // Les 4 derniers éléments de la liste (galeries récentes)
    const otherGalleries = galleries.slice(0, galleries.length - 4); // Toutes les autres galeries

    // Afficher les 4 dernières galeries
    latestGalleries.forEach(gallery => {
        // Ici, on n'inclut pas les chapitres dans l'URL
        const galleryName = gallery.Name.split('Chapitre')[0]; // Récupérer seulement le nom de la galerie, sans le chapitre
        const galleryItem = createGalleryItem(galleryName, gallery.image1);
        latestGalleryList.appendChild(galleryItem);
    });

    // Afficher toutes les autres galeries
    otherGalleries.forEach(gallery => {
        const firstChapter = filteredEbooks.find(ebook => 
            ebook.Name.startsWith(gallery) && ebook.Name.includes('Chapitre1')
        );

        if (firstChapter) {
            const galleryItem = createGalleryItem(gallery, firstChapter.image1);
            allGalleryList.appendChild(galleryItem);
        }
    });
}

// Fonction pour créer un élément de galerie
function createGalleryItem(gallery, imageUrl) {
    const galleryItem = document.createElement('div');
    galleryItem.classList.add('gallery-item');

    const thumbnail = document.createElement('img');
    thumbnail.src = imageUrl; // Première image comme miniature
    thumbnail.alt = gallery;
    galleryItem.appendChild(thumbnail);

    const title = document.createElement('h2');
    title.textContent = gallery;
    galleryItem.appendChild(title);

    // Redirection vers la page chapters.html sans inclure le chapitre dans l'URL
    galleryItem.addEventListener('click', () => {
        window.location.href = `chapters.html?title=${encodeURIComponent(gallery)}`;
    });

    return galleryItem;
}


    // Fonction pour filtrer les eBooks en fonction de la recherche
    function filterEbooks() {
        const searchTerm = searchInput.value.toLowerCase();
        const filteredEbooks = ebooks.filter(ebook =>
            ebook.Name.toLowerCase().includes(searchTerm)
        );
        displayEbooks(filteredEbooks);
    }

    // Écouter le bouton de recherche
    searchButton.addEventListener('click', filterEbooks);

    // Charger tous les eBooks au démarrage
    fetchEbooks();
});
