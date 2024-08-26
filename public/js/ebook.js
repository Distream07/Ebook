document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.getElementById('gallery');
    const listView = document.getElementById('listView');
    const ebookImage = document.getElementById('ebookImage');
    const prevButton = document.getElementById('prevButton');
    const nextButton = document.getElementById('nextButton');
    const slideshowButton = document.getElementById('slideshowButton');
    const listButton = document.getElementById('listButton');
    const nextChapterButton = document.getElementById('nextChapterButton');
    const prevChapterButton = document.getElementById('prevChapterButton'); // Nouveau : Bouton chapitre précédent
    const images = [];
    let currentIndex = 0;
    let currentId = ''; // ID du eBook courant
    let currentTitle = ''; // Titre actuel du chapitre

    // Fonction pour récupérer les paramètres de l'URL
    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Fonction pour récupérer les détails d'un eBook
    function fetchEbook(id) {
        fetch(`/api/ebooks/${id}`)
            .then(response => response.json())
            .then(data => {
                gallery.style.display = 'block';
                listView.innerHTML = ''; // Clear the list view
                images.length = 0; // Clear the images array

                currentId = data._id; // Définir l'ID du eBook courant
                currentTitle = data.Name; // Définir le titre actuel du chapitre

                for (let i = 1; i <= 100000; i++) {
                    if (data[`image${i}`]) {
                        images.push(data[`image${i}`]);

                        // Add to list view
                        const imgElement = document.createElement('img');
                        imgElement.src = data[`image${i}`];
                        listView.appendChild(imgElement);
                    }
                }

                if (images.length > 0) {
                    currentIndex = 0;
                    updateImage();
                }

                // Mise à jour des boutons après avoir chargé les détails de l'eBook
                checkChapterAvailability();
            })
            .catch(error => console.error('Erreur lors de la récupération des détails de l\'eBook:', error));
    }

    // Fonction pour mettre à jour l'image affichée
    function updateImage() {
        if (images.length > 0) {
            ebookImage.src = images[currentIndex];
            updateButtons();
        }
    }

    // Fonction pour mettre à jour l'état des boutons de navigation
    function updateButtons() {
        if (currentIndex === 0) {
            prevButton.classList.add('disabled');
            prevButton.disabled = true;
        } else {
            prevButton.classList.remove('disabled');
            prevButton.disabled = false;
        }

        if (currentIndex === images.length - 1) {
            nextButton.classList.add('disabled');
            nextButton.disabled = true;
        } else {
            nextButton.classList.remove('disabled');
            nextButton.disabled = false;
        }
    }

    // Fonction pour naviguer à l'image suivante
    window.nextImage = () => {
        if (currentIndex < images.length - 1) {
            currentIndex++;
            updateImage();
        }
    };

    // Fonction pour naviguer à l'image précédente
    window.prevImage = () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateImage();
        }
    };

    // Fonction pour passer en mode diaporama
    function showSlideshow() {
        gallery.style.display = 'block';
        listView.style.display = 'none';
        if (images.length > 0) {
            updateImage();
        }
    }

    // Fonction pour passer en mode liste
    function showListView() {
        gallery.style.display = 'none';
        listView.style.display = 'block';
    }

    // Fonction pour changer au chapitre suivant
    function nextChapter() {
        changeChapter(1); // Incrémente le chapitre
    }

    // Fonction pour revenir au chapitre précédent
    function prevChapter() {
        changeChapter(-1); // Décrémente le chapitre
    }

    // Fonction générique pour changer de chapitre
    function changeChapter(increment) {
        const chapterKeyword = 'Chapitre';
        const titleLower = currentTitle.toLowerCase(); // Convertir le titre actuel en minuscules
        const chapterIndex = titleLower.indexOf(chapterKeyword.toLowerCase());

        if (chapterIndex !== -1) {
            // Récupérer la partie avant "Chapitre"
            const baseTitle = currentTitle.substring(0, chapterIndex + chapterKeyword.length);

            // Extraire le numéro de chapitre
            const chapterNumberString = currentTitle.substring(chapterIndex + chapterKeyword.length);
            const chapterNumber = parseInt(chapterNumberString, 10);

            if (!isNaN(chapterNumber)) {
                const newChapter = chapterNumber + increment;

                // Vérifier que le numéro du chapitre est valide
                if (newChapter <= 0) {
                    console.error('Aucun chapitre précédent.');
                    return;
                }

                // Créer le nouveau titre pour le chapitre sans espace entre "Chapitre" et le numéro
                const newTitle = `${baseTitle}${newChapter}`;

                // Récupérer tous les eBooks pour trouver le bon chapitre
                fetch('/api/ebooks')
                    .then(response => response.json())
                    .then(data => {
                        let found = false;
                        for (const ebook of data) {
                            if (ebook.Name === newTitle) {
                                // Trouvé le chapitre, rediriger vers l'eBook correspondant
                                window.location.href = `ebook.html?id=${ebook._id}`;
                                found = true;
                                break;
                            }
                        }

                        if (!found) {
                            console.error('Chapitre non trouvé');
                        }
                    })
                    .catch(error => console.error('Erreur lors de la récupération des eBooks:', error));
            } else {
                console.error('Numéro de chapitre invalide.');
            }
        } else {
            console.error('Impossible de trouver "Chapitre" dans le titre.');
        }
    }

    // Fonction pour vérifier l'existence des chapitres précédent et suivant
    function checkChapterAvailability() {
        const chapterKeyword = 'Chapitre';
        const titleLower = currentTitle.toLowerCase(); // Convertir le titre actuel en minuscules
        const chapterIndex = titleLower.indexOf(chapterKeyword.toLowerCase());

        if (chapterIndex !== -1) {
            // Récupérer la partie avant "Chapitre"
            const baseTitle = currentTitle.substring(0, chapterIndex + chapterKeyword.length);

            // Extraire le numéro de chapitre
            const chapterNumberString = currentTitle.substring(chapterIndex + chapterKeyword.length);
            const chapterNumber = parseInt(chapterNumberString, 10);

            if (!isNaN(chapterNumber)) {
                const prevChapterNumber = chapterNumber - 1;
                const nextChapterNumber = chapterNumber + 1;

                const prevChapterTitle = `${baseTitle}${prevChapterNumber}`;
                const nextChapterTitle = `${baseTitle}${nextChapterNumber}`;

                // Vérifier l'existence du chapitre précédent et suivant
                fetch('/api/ebooks')
                    .then(response => response.json())
                    .then(data => {
                        const prevChapterExists = data.some(ebook => ebook.Name === prevChapterTitle);
                        const nextChapterExists = data.some(ebook => ebook.Name === nextChapterTitle);

                        // Mettre à jour les boutons en fonction de la disponibilité des chapitres
                        if (prevChapterExists) {
                            prevChapterButton.classList.remove('disabled');
                            prevChapterButton.disabled = false;
                        } else {
                            prevChapterButton.classList.add('disabled');
                            prevChapterButton.disabled = true;
                        }

                        if (nextChapterExists) {
                            nextChapterButton.classList.remove('disabled');
                            nextChapterButton.disabled = false;
                        } else {
                            nextChapterButton.classList.add('disabled');
                            nextChapterButton.disabled = true;
                        }
                    })
                    .catch(error => console.error('Erreur lors de la vérification des chapitres:', error));
            } else {
                console.error('Numéro de chapitre invalide.');
            }
        } else {
            console.error('Impossible de trouver "Chapitre" dans le titre.');
        }
    }

    // Ajouter des événements pour les boutons "Chapitre Suivant" et "Chapitre Précédent"
    nextChapterButton.addEventListener('click', nextChapter);
    prevChapterButton.addEventListener('click', prevChapter); // Nouveau : bouton chapitre précédent

    // Événements pour les boutons de vue
    slideshowButton.addEventListener('click', showSlideshow);
    listButton.addEventListener('click', showListView);

    // Écoute des événements de clavier pour la navigation
    document.addEventListener('keydown', (event) => {
        if (event.key === 'ArrowRight') {
            nextImage();
        } else if (event.key === 'ArrowLeft') {
            prevImage();
        }
    });

    // Initialisation
    const ebookId = getQueryParam('id');
    if (ebookId) {
        fetchEbook(ebookId);
    } else {
        console.error('Aucun ID eBook fourni.');
    }
   // Initialiser la gestion de l'opacité et des animations pour les boutons de navigation
   const navButtons = document.querySelectorAll('.nav-button');

   // Fonction pour réinitialiser l'opacité et l'animation des deux boutons
   function resetOpacityForBothButtons() {
       navButtons.forEach(button => {
           button.style.opacity = '0.5'; // Réinitialiser l'opacité
           button.style.animation = 'none'; // Désactiver temporairement l'animation
           setTimeout(() => {
               button.style.animation = ''; // Réactiver l'animation
           }, 10);
       });
   }

   // Appliquer les événements de clic à chaque bouton de navigation
   navButtons.forEach(button => {
       button.addEventListener('click', resetOpacityForBothButtons);
   });

   // Appliquer les événements de survol pour désactiver temporairement l'animation et la réactiver après le survol
   navButtons.forEach(button => {
       button.addEventListener('mouseenter', () => {
           button.style.opacity = '0.7'; // Opacité complète lors du survol
           button.style.animation = 'none'; // Stopper temporairement l'animation
       });

       button.addEventListener('mouseleave', () => {
           button.style.opacity = '0.5'; // Remettre l'opacité à 0.5 après le survol
           setTimeout(() => {
               button.style.animation = ''; // Réactiver l'animation après le survol
           }, 10);
       });
   });
});