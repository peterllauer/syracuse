document.addEventListener('DOMContentLoaded', () => {
    const chapterSelect = document.getElementById('chapter-select');
    const pageSelect = document.getElementById('page-select');
    const mangaImage = document.getElementById('manga-image');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    console.log("We're online!")

    let chapters = [];
    let currentChapter = 1;
    let currentPage = 1;

    // Fetch chapter data
    fetch('chapters.json')
        .then(response => response.json())
        .then(data => {
            chapters = data;
            populateChapters();
            loadChapter(currentChapter);
        })
        .catch(error => console.error('Error loading chapters:', error));

    function populateChapters() {
        chapterSelect.innerHTML = chapters.map(ch => 
            `<option value="${ch.chapter}">Chapter ${ch.chapter}</option>`
        ).join('');
    }

    function loadChapter(chapterNumber) {
        const chapter = chapters.find(ch => ch.chapter === chapterNumber);
        if (!chapter) return;

        // Populate pages dropdown
        pageSelect.innerHTML = Array.from({length: chapter.pages}, (_, i) => 
            `<option value="${i + 1}">Page ${i + 1}</option>`
        ).join('');

        // Load first page of chapter
        currentChapter = chapterNumber;
        currentPage = 1;
        updatePage();
    }

    function updatePage() {
        const imageUrl = `chapters/${currentChapter}/${currentPage}.jpg`;
        mangaImage.src = imageUrl;
        
        // Update dropdown selections
        chapterSelect.value = currentChapter;
        pageSelect.value = currentPage;
    }

    // Chapter selection change
    chapterSelect.addEventListener('change', (e) => {
        currentChapter = parseInt(e.target.value);
        loadChapter(currentChapter);
    });

    // Page selection change
    pageSelect.addEventListener('change', (e) => {
        currentPage = parseInt(e.target.value);
        updatePage();
    });

    // Navigation buttons
    prevBtn.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
        } else {
            const prevChapter = chapters.findIndex(ch => ch.chapter === currentChapter) - 1;
            if (prevChapter >= 0) {
                currentChapter = chapters[prevChapter].chapter;
                currentPage = chapters[prevChapter].pages;
            }
        }
        updatePage();
    });

    nextBtn.addEventListener('click', () => {
        const currentChapterData = chapters.find(ch => ch.chapter === currentChapter);
        if (currentPage < currentChapterData.pages) {
            currentPage++;
        } else {
            const nextChapter = chapters.findIndex(ch => ch.chapter === currentChapter) + 1;
            if (nextChapter < chapters.length) {
                currentChapter = chapters[nextChapter].chapter;
                currentPage = 1;
            }
        }
        updatePage();
    });

    // Handle image loading errors
    mangaImage.addEventListener('error', () => {
        mangaImage.alt = 'Failed to load page';
        console.error(`Error loading page: chapters/${currentChapter}/${currentPage}.jpg`);
    });
});
