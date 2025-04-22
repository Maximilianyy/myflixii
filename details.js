const API_CONFIG = {
    KEY: '44c1c5499fd7be8edbf1b1af24bf5117',
    TMDB_BASE: 'https://api.themoviedb.org/3',
    IMAGE_BASE: 'https://image.tmdb.org/t/p/original',
    STREAM_BASE: 'https://iframe.pstream.org/embed'
};

// Get URL parameters
const urlParams = new URLSearchParams(window.location.search);
const mediaType = urlParams.get('type');
const mediaId = urlParams.get('id');

// DOM Elements
const elements = {
    poster: document.getElementById('mediaPoster'),
    player: document.getElementById('playerFrame'),
    title: document.getElementById('mediaTitle'),
    year: document.getElementById('mediaYear'),
    rating: document.getElementById('mediaRating'),
    overview: document.getElementById('mediaOverview'),
    episodeSelector: document.getElementById('episodeSelector'),
    seasonSelect: document.getElementById('seasonSelect'),
    episodeSelect: document.getElementById('episodeSelect')
};

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const data = await fetchMediaData();
        updatePageContent(data);
        initializePlayer(data);
    } catch (error) {
        console.error('Failed to load media:', error);
    }
});

// Fetch media data
async function fetchMediaData() {
    const response = await fetch(
        `${API_CONFIG.TMDB_BASE}/${mediaType}/${mediaId}?api_key=${API_CONFIG.KEY}`
    );
    if (!response.ok) throw new Error('Failed to fetch media data');
    return response.json();
}

// Update page content
function updatePageContent(data) {
    document.title = `MyFlixi - ${data.title || data.name}`;
    elements.poster.src = `${API_CONFIG.IMAGE_BASE}${data.poster_path}`;
    elements.poster.alt = data.title || data.name;
    elements.title.textContent = data.title || data.name;
    elements.year.textContent = (data.release_date || data.first_air_date)?.split('-')[0] || '';
    elements.rating.innerHTML = `<i class="fas fa-star"></i> ${data.vote_average.toFixed(1)}`;
    elements.overview.textContent = data.overview;
}

// Initialize player
function initializePlayer(data) {
    if (mediaType === 'movie') {
        elements.player.src = `${API_CONFIG.STREAM_BASE}/tmdb-movie-${mediaId}`;
        elements.episodeSelector.classList.add('hidden');
    } else {
        setupTVShow(data);
    }
}

// Setup TV show episodes
async function setupTVShow(show) {
    elements.episodeSelector.classList.remove('hidden');
    
    const seasons = show.seasons.filter(season => season.season_number > 0);
    elements.seasonSelect.innerHTML = seasons
        .map(season => `
            <option value="${season.season_number}">
                Season ${season.season_number}
            </option>
        `).join('');

    elements.seasonSelect.onchange = () => loadEpisodes(elements.seasonSelect.value);
    elements.episodeSelect.onchange = () => playEpisode(
        elements.seasonSelect.value,
        elements.episodeSelect.value
    );

    await loadEpisodes(seasons[0].season_number);
}

// Load episodes for selected season
async function loadEpisodes(seasonNumber) {
    try {
        const response = await fetch(
            `${API_CONFIG.TMDB_BASE}/tv/${mediaId}/season/${seasonNumber}?api_key=${API_CONFIG.KEY}`
        );
        const data = await response.json();
        
        elements.episodeSelect.innerHTML = data.episodes
            .map(episode => `
                <option value="${episode.episode_number}">
                    Episode ${episode.episode_number}: ${episode.name}
                </option>
            `).join('');
        
        playEpisode(seasonNumber, data.episodes[0].episode_number);
    } catch (error) {
        console.error('Failed to load episodes:', error);
    }
}

// Play episode
function playEpisode(season, episode) {
    elements.player.src = `${API_CONFIG.STREAM_BASE}/tmdb-tv-${mediaId}/${season}/${episode}`;
}