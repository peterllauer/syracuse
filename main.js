let chapters = [];
let currentChapter = 1;
let currentPage = 1;

// Utility functions
function parseURL() {
    const hash = window.location.hash.substring(1);
    const params = new URLSearchParams(hash);
    
    const chapter = parseInt(params.get('chapter'));
    const page = parseInt(params.get('page'));
    
    return !isNaN(chapter) && !isNaN(page) ? { chapter, page } : null;
}

function updateURL() {
    const newHash = `chapter=${currentChapter}&page=${currentPage}`;
    history.pushState(null, '', `#${newHash}`);
}

function handleHashChange() {
    const urlParams = parseURL();
    if (urlParams) {
        const chapterExists = chapters.some(ch => ch.chapter === urlParams.chapter);
        if (chapterExists) {
            if (urlParams.chapter !== currentChapter || urlParams.page !== currentPage) {
                currentChapter = urlParams.chapter;
                currentPage = urlParams.page;
                loadChapter(currentChapter);
            }
        }
    }
}

// Main functions
function loadChapter(chapterNumber) {
    const chapter = chapters.find(ch => ch.chapter === chapterNumber);
    if (!chapter) {
        // Fallback to first chapter if invalid
        currentChapter = chapters[0].chapter;
        currentPage = 1;
        updateURL();
        return;
    }

    document.querySelector('.loading-container').classList.add('loading');
    document.getElementById('manga-image').src = '';
    // Validate page number is within bounds
    currentPage = Math.min(Math.max(currentPage, 1), chapter.pages);

    // Update page dropdown
    const pageSelect = document.getElementById('page-select');
    pageSelect.innerHTML = Array.from({length: chapter.pages}, (_, i) => 
        `<option value="${i + 1}">Page ${i + 1}</option>`
    ).join('');

    updatePage();
}

function updatePage() {
    const mangaImage = document.getElementById('manga-image');
    const loadingContainer = document.querySelector('.loading-container');
    
    // Show loading state
    loadingContainer.classList.add('loading');
    
    // Clear current image
    mangaImage.src = '';
    mangaImage.alt = 'Loading...';
    
    // Load new image
    const imageUrl = `chapters/${currentChapter}/${currentPage}.jpg`;
    const newImage = new Image();
    
    newImage.onload = function() {
        mangaImage.src = imageUrl;
        mangaImage.alt = `Chapter ${currentChapter} Page ${currentPage}`;
        loadingContainer.classList.remove('loading');
        mangaImage.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };
    
    newImage.onerror = function() {
        mangaImage.alt = 'Failed to load page';
        loadingContainer.classList.remove('loading');
        console.error(`Error loading page: ${imageUrl}`);
    };
    
    newImage.src = imageUrl;
    
    // Update URL and dropdowns
    updateURL();
    document.getElementById('chapter-select').value = currentChapter;
    document.getElementById('page-select').value = currentPage;
}
// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Set up event listeners
    window.addEventListener('popstate', handleHashChange);
    window.addEventListener('hashchange', handleHashChange);

    document.getElementById('chapter-select').addEventListener('change', (e) => {
        currentChapter = parseInt(e.target.value);
        loadChapter(currentChapter);
    });

    document.getElementById('page-select').addEventListener('change', (e) => {
        currentPage = parseInt(e.target.value);
        updatePage();
    });

    document.getElementById('prev-btn').addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
        } else {
            const prevChapterIndex = chapters.findIndex(ch => ch.chapter === currentChapter) - 1;
            if (prevChapterIndex >= 0) {
                currentChapter = chapters[prevChapterIndex].chapter;
                currentPage = chapters[prevChapterIndex].pages;
            }
        }
        updatePage();
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        const currentChapterData = chapters.find(ch => ch.chapter === currentChapter);
        if (currentPage < currentChapterData.pages) {
            currentPage++;
        } else {
            const nextChapterIndex = chapters.findIndex(ch => ch.chapter === currentChapter) + 1;
            if (nextChapterIndex < chapters.length) {
                currentChapter = chapters[nextChapterIndex].chapter;
                currentPage = 1;
            }
        }
        updatePage();
    });

    // Initial data load
    fetch('./chapters.json')
        .then(response => response.json())
        .then(data => {
            chapters = data;
            // Populate chapter dropdown
            const chapterSelect = document.getElementById('chapter-select');
            chapterSelect.innerHTML = chapters.map(ch => 
                `<option value="${ch.chapter}">Chapter ${ch.chapter}</option>`
            ).join('');
            // Handle initial URL state
            handleHashChange();
        })
        .catch(error => console.error('Error loading chapters:', error));
});
