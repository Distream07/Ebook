document.addEventListener('DOMContentLoaded', () => {
    const presentationImage = document.getElementById('presentationImage');
    const chapterButtons = document.getElementById('chapterButtons');

    // Fonction pour récupérer les paramètres de l'URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Fonction pour récupérer les chapitres d'une galerie
    function fetchChapters(title) {
        fetch(`/api/ebooks`)
            .then(response => response.json())
            .then(data => {
                // Filtrer les ebooks qui commencent par le titre de la galerie
                const chapters = data.filter(ebook => ebook.Name.startsWith(title));
                if (chapters.length > 0) {
                    // Récupérer l'ID du premier chapitre
                    const firstChapter = chapters[0]._id;

                    // Appeler fetchDescription avec l'ID du premier chapitre
                    fetchDescription(firstChapter);

                    // Afficher les chapitres dans les boutons
                    displayChapters(chapters);
                } else {
                    console.error('Aucun chapitre trouvé pour ce titre.');
                }
            })
            .catch(error => console.error('Erreur lors de la récupération des chapitres:', error));
    }

    // Fonction pour récupérer la description du premier chapitre
    function fetchDescription(id) {
        fetch(`/api/ebooks`)
            .then(response => response.json())
            .then(data => {
                console.log('ID du premier chapitre:', id);
                
                // Trouver l'eBook correspondant à l'ID
                const ebook = data.find(ebook => ebook._id === id);

                if (ebook) {
                    document.getElementById("DescriptionText").innerHTML = ebook.Description;
                } else {
                    console.error('eBook non trouvé.');
                }
            })
            .catch(error => console.error('Erreur lors de la récupération de la description:', error));
    }

    // Fonction pour afficher les chapitres sous forme de boutons
    function displayChapters(chapters) {
        if (chapters.length > 0) {
            // Afficher l'image de présentation du premier chapitre
            const firstChapter = chapters.find(ebook => ebook.Name.includes('Chapitre1'));
            if (firstChapter) {
                presentationImage.src = firstChapter.image1;
            }

            // Afficher les boutons pour chaque chapitre
            chapterButtons.innerHTML = '';

            // Trier les chapitres en ordre croissant
            chapters.sort((a, b) => {
                const numA = parseInt(a.Name.split('Chapitre')[1], 10) || 0;
                const numB = parseInt(b.Name.split('Chapitre')[1], 10) || 0;
                return numA - numB; // Tri croissant
            });

            chapters.forEach(ebook => {
                const chapterTitle = ebook.Name.split('Chapitre')[1].trim();
                if (chapterTitle) {
                    const button = document.createElement('button');
                    button.textContent = `Chapitre ${chapterTitle}`;
                    button.addEventListener('click', () => {
                        window.location.href = `ebook.html?id=${ebook._id}`;
                    });
                    chapterButtons.appendChild(button);
                }
            });
        } else {
            chapterButtons.innerHTML = '<p>Aucun chapitre disponible.</p>';
        }
    }

    // Initialisation : récupérer le titre depuis l'URL
    const galleryTitle = getQueryParam('title');
    if (galleryTitle) {
        fetchChapters(galleryTitle);
    } else {
        console.error('Titre de galerie non fourni.');
    }
});
