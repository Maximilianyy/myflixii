// API Configuration
const API_CONFIG = {
    KEY: '44c1c5499fd7be8edbf1b1af24bf5117',
    TMDB_BASE: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/original',
    PSTREAM_BASE: 'https://iframe.pstream.org'
};

// DOM Elements
const DOM = {
    loader: document.getElementById('loader'),
    search: {
        input: document.getElementById('searchInput'),
        results: document.getElementById('searchResults')
    },
    content: {
        trending: document.getElementById('trendingContent'),
        movies: document.getElementById('moviesContent'),
        shows: document.getElementById('showsContent')
    },
    featured: {
        container: document.getElementById('featured'),
        title: document.getElementById('featuredTitle'),
        description: document.getElementById('featuredDesc'),
        playButton: document.getElementById('playFeatured')
    }
};

// Initialize App
document.addEventListener('DOMContentLoaded', async () => {
    try {
        await Promise.all([
            loadFeaturedContent(),
            loadTrendingContent(),
            loadPopularMovies(),
            loadPopularShows()
        ]);
        setupEventListeners();
    } catch (error) {
        console.error('Initialization error:', error);
    } finally {
        hideLoader();
    }
});

// Event Listeners Setup
function setupEventListeners() {
    // Search handling with Enter key
    DOM.search.input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch(DOM.search.input.value.trim());
        }
    });

    // Slide navigation
    document.querySelectorAll('.slide-btn').forEach(btn => {
        btn.addEventListener('click', handleSlideNavigation);
    });
}

// Content Loading Functions
async function loadFeaturedContent() {
    try {
        const data = await fetchFromTMDB('/trending/all/day');
        const featured = data.results[0];
        updateFeaturedSection(featured);
    } catch (error) {
        console.error('Failed to load featured content:', error);
    }
}

async function loadTrendingContent() {
    const data = await fetchFromTMDB('/trending/all/day');
    displayContent(data.results.slice(1), DOM.content.trending);
}

async function loadPopularMovies() {
    const data = await fetchFromTMDB('/movie/popular');
    displayContent(data.results, DOM.content.movies);
}

async function loadPopularShows() {
    const data = await fetchFromTMDB('/tv/popular');
    displayContent(data.results, DOM.content.shows);
}

// Search Functions
async function handleSearch(query) {
    if (!query) return;

    try {
        const [movies, shows] = await Promise.all([
            fetchFromTMDB('/search/movie', { query }),
            fetchFromTMDB('/search/tv', { query })
        ]);

        displaySearchResults([...movies.results, ...shows.results]);
    } catch (error) {
        console.error('Search failed:', error);
    }
}

function displaySearchResults(results) {
    if (!results.length) {
        DOM.search.results.classList.remove('active');
        return;
    }

    DOM.search.results.innerHTML = `
        <div class="search-list">
            ${results.map(item => `
                <div class="search-item" onclick="navigateToDetails('${item.title ? 'movie' : 'tv'}', ${item.id})">
                    <span class="title">${item.title || item.name}</span>
                    <span class="type">${item.title ? 'Movie' : 'TV Show'}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    DOM.search.results.classList.add('active');
}

// Display Functions
function displayContent(items, container) {
    container.innerHTML = items.map(item => createContentCard(item)).join('');
}

function createContentCard(item) {
    const type = item.title ? 'movie' : 'tv';
    return `
        <div class="content-card" onclick="navigateToDetails('${type}', ${item.id})">
            <img src="${API_CONFIG.IMAGE_BASE}${item.poster_path}" 
                 alt="${item.title || item.name}">
            <div class="content-info">
                <h3>${item.title || item.name}</h3>
                <div class="rating">
                    <i class="fas fa-star"></i>
                    ${item.vote_average.toFixed(1)}
                </div>
            </div>
        </div>
    `;
}

// Navigation Functions
function navigateToDetails(type, id) {
    window.location.href = `details.html?type=${type}&id=${id}`;
}

function handleSlideNavigation(e) {
    const direction = e.target.classList.contains('prev') ? -1 : 1;
    const slider = e.target.closest('.content-section').querySelector('.content-grid');
    
    slider.scrollBy({
        left: direction * (slider.offsetWidth - 100),
        behavior: 'smooth'
    });
}

// Utility Functions
async function fetchFromTMDB(endpoint, params = {}) {
    const queryParams = new URLSearchParams({
        api_key: API_CONFIG.KEY,
        ...params
    });
    
    const response = await fetch(`${API_CONFIG.TMDB_BASE}${endpoint}?${queryParams}`);
    if (!response.ok) throw new Error('TMDB API request failed');
    return response.json();
}

function updateFeaturedSection(item) {
    DOM.featured.container.style.backgroundImage = `url(${API_CONFIG.IMAGE_BASE}${item.backdrop_path})`;
    DOM.featured.title.textContent = item.title || item.name;
    DOM.featured.description.textContent = item.overview;
}

function hideLoader() {
    DOM.loader.style.opacity = '0';
    setTimeout(() => DOM.loader.style.display = 'none', 300);
}

// Close search results when clicking outside
document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-bar')) {
        DOM.search.results.classList.remove('active');
    }
});
document.addEventListener('DOMContentLoaded', () => {
    const playFeaturedButton = document.getElementById('playFeatured');
    const playerFrame = document.getElementById('playerFrame'); // iFrame aus details.html

    if (playFeaturedButton) {
        playFeaturedButton.addEventListener('click', () => {
            const featuredMediaId = '12345'; // Beispiel-ID für die Show
            const featuredMediaType = 'movie'; // Oder 'tv', je nach Typ

            // Setze die URL für den Player
            const streamUrl = `${API_CONFIG.STREAM_BASE}/tmdb-${featuredMediaType}-${featuredMediaId}`;
            playerFrame.src = streamUrl;

            // Optional: Weiterleitung zur Details-Seite
            window.location.href = `details.html?type=${featuredMediaType}&id=${featuredMediaId}`;
        });
    }
});
document.addEventListener('DOMContentLoaded', () => {
    // Deaktiviert das Markieren von Text
    document.addEventListener('selectstart', (e) => e.preventDefault());

    // Deaktiviert das Kopieren von Inhalten
    document.addEventListener('copy', (e) => {
        e.preventDefault();
        alert('Das Kopieren von Inhalten ist auf dieser Seite deaktiviert.');
    });

    // Deaktiviert das Rechtsklicken
    document.addEventListener('contextmenu', (e) => e.preventDefault());
});
document.addEventListener('DOMContentLoaded', async () => {
    const playFeaturedButton = document.getElementById('playFeatured');
    const featuredTitle = document.getElementById('featuredTitle');
    const featuredDesc = document.getElementById('featuredDesc');

    try {
        // Lade die Featured-Daten (z. B. den beliebtesten Film oder die beliebteste Serie)
        const featuredData = await fetchFeaturedMedia();

        // Aktualisiere die Inhalte der Featured-Sektion
        featuredTitle.textContent = featuredData.title || featuredData.name;
        featuredDesc.textContent = featuredData.overview;

        // Setze den Hintergrund der Featured-Sektion
        document.querySelector('.featured').style.backgroundImage = `url(${API_CONFIG.IMAGE_BASE}${featuredData.backdrop_path})`;

        // Verknüpfe den Play-Button mit der Details-Seite
        playFeaturedButton.addEventListener('click', () => {
            const mediaType = featuredData.media_type || 'movie'; // 'movie' oder 'tv'
            const mediaId = featuredData.id;

            // Weiterleitung zur Details-Seite
            window.location.href = `details.html?type=${mediaType}&id=${mediaId}`;
        });
    } catch (error) {
        console.error('Failed to load featured media:', error);
    }
});

// Funktion zum Abrufen der Featured-Daten
async function fetchFeaturedMedia() {
    const response = await fetch(`${API_CONFIG.TMDB_BASE}/trending/all/day?api_key=${API_CONFIG.KEY}`);
    if (!response.ok) throw new Error('Failed to fetch featured media');
    const data = await response.json();
    return data.results[0]; // Nimm das erste Ergebnis als Featured-Inhalt
}