// ========== GLOBAL RADIO APP - ALL 135 FUNCTIONS ==========

// ========== GLOBAL VARIABLES ==========
let currentStation = null;
let isPlaying = false;
let currentVolume = 70;
let isMuted = false;
let favorites = [];
let recentStations = [];
let history = [];
let sleepTimerInterval = null;
let sleepTimerEndTime = null;
let recordingStartTime = null;
let recordingInterval = null;
let mediaRecorder = null;
let audioContext = null;
let sourceNode = null;
let analyserNode = null;
let animationId = null;
let currentEqPreset = 'normal';
let eqSliders = {};
let totalListeningMinutes = 0;
let listeningStreak = 0;
let lastListenDate = null;
let alarmTime = null;
let alarmInterval = null;
let currentAlarmStation = null;
let dataSaverMode = false;
let backgroundPlayback = true;
let notificationsEnabled = true;
let currentBitrate = 128;
let cacheSize = 0;
let chart = null;

// Stations Database (Demo)
const stationsDB = [
    { id: 1, name: "Cool FM Lagos", country: "Nigeria", genre: "Pop/Hip Hop", language: "English", streamUrl: "https://stream.coolfm.ng/live", bitrate: 128, listeners: 45200, favicon: "🎵", tags: ["pop", "hiphop", "lagos"] },
    { id: 2, name: "BBC Radio 1", country: "UK", genre: "Pop/Rock", language: "English", streamUrl: "https://stream.live.vc.bbcmedia.co.uk/bbc_radio_one", bitrate: 128, listeners: 89000, favicon: "🎵", tags: ["pop", "rock", "bbc"] },
    { id: 3, name: "NRJ", country: "France", genre: "Top 40", language: "French", streamUrl: "https://stream.nrj.fr/nrj", bitrate: 128, listeners: 67000, favicon: "🎵", tags: ["top40", "french"] },
    { id: 4, name: "Virgin Radio", country: "UK", genre: "Rock", language: "English", streamUrl: "https://radio.virginradio.co.uk/stream", bitrate: 128, listeners: 34000, favicon: "🎵", tags: ["rock", "classic"] },
    { id: 5, name: "Wazobia FM", country: "Nigeria", genre: "Pidgin/Comedy", language: "Pidgin", streamUrl: "https://stream.wazobiafm.ng/live", bitrate: 128, listeners: 28900, favicon: "🎵", tags: ["pidgin", "comedy", "lagos"] },
    { id: 6, name: "Kiss FM", country: "UK", genre: "Dance/Pop", language: "English", streamUrl: "https://stream.kissfm.co.uk/live", bitrate: 128, listeners: 45600, favicon: "🎵", tags: ["dance", "pop", "uk"] },
    { id: 7, name: "Radio France International", country: "France", genre: "News/Talk", language: "French", streamUrl: "https://rfien direct.mp3", bitrate: 96, listeners: 23400, favicon: "🎵", tags: ["news", "talk", "french"] },
    { id: 8, name: "Smooth Jazz", country: "USA", genre: "Jazz", language: "English", streamUrl: "https://stream.smoothjazz.com/live", bitrate: 192, listeners: 18900, favicon: "🎵", tags: ["jazz", "smooth", "relax"] },
    { id: 9, name: "Classic FM", country: "UK", genre: "Classical", language: "English", streamUrl: "https://stream.classicfm.com/live", bitrate: 128, listeners: 56700, favicon: "🎵", tags: ["classical", "orchestra"] },
    { id: 10, name: "Naija FM", country: "Nigeria", genre: "Afrobeat", language: "Yoruba", streamUrl: "https://stream.naijafm.ng/live", bitrate: 128, listeners: 34500, favicon: "🎵", tags: ["afrobeat", "yoruba", "lagos"] },
    { id: 11, name: "Radio 1", country: "USA", genre: "Top 40", language: "English", streamUrl: "https://stream.radio1.com/live", bitrate: 128, listeners: 67800, favicon: "🎵", tags: ["top40", "usa"] },
    { id: 12, name: "Capital FM", country: "UK", genre: "Pop", language: "English", streamUrl: "https://stream.capitalfm.com/live", bitrate: 128, listeners: 54300, favicon: "🎵", tags: ["pop", "uk"] },
    { id: 13, name: "Radio Ergo", country: "Somalia", genre: "News/Talk", language: "Somali", streamUrl: "https://radioergo.org/stream", bitrate: 64, listeners: 8900, favicon: "🎵", tags: ["news", "somali"] },
    { id: 14, name: "C capital", country: "Ivory Coast", genre: "Afrobeat", language: "French", streamUrl: "https://stream.c capital.ci/live", bitrate: 128, listeners: 15600, favicon: "🎵", tags: ["afrobeat", "french"] },
    { id: 15, name: "Africa No 1", country: "Gabon", genre: "African", language: "French", streamUrl: "https://africa no1.com/stream", bitrate: 128, listeners: 23400, favicon: "🎵", tags: ["african", "french"] },
    { id: 16, name: "Y FM", country: "Ghana", genre: "Hip Hop", language: "English", streamUrl: "https://stream.yfm.gh/live", bitrate: 128, listeners: 19800, favicon: "🎵", tags: ["hiphop", "ghana"] },
    { id: 17, name: "Radio Zeta", country: "Italy", genre: "Rock", language: "Italian", streamUrl: "https://radiozeta.it/stream", bitrate: 128, listeners: 12300, favicon: "🎵", tags: ["rock", "italian"] },
    { id: 18, name: "MDR Sputnik", country: "Germany", genre: "Alternative", language: "German", streamUrl: "https://mdr.de/sputnik stream", bitrate: 128, listeners: 18700, favicon: "🎵", tags: ["alternative", "german"] },
    { id: 19, name: "Radio 538", country: "Netherlands", genre: "Pop", language: "Dutch", streamUrl: "https://radio538.nl/stream", bitrate: 128, listeners: 45600, favicon: "🎵", tags: ["pop", "dutch"] },
    { id: 20, name: "RTL 102.5", country: "Italy", genre: "Pop", language: "Italian", streamUrl: "https://rtl1025.it/stream", bitrate: 128, listeners: 34500, favicon: "🎵", tags: ["pop", "italian"] }
];

// ========== INITIALIZATION ==========
document.addEventListener('deviceready', onDeviceReady, false);
window.addEventListener('load', onPageLoad);

function onPageLoad() {
    setTimeout(() => {
        const splash = document.getElementById('splashScreen');
        if (splash) splash.style.display = 'none';
        initializeApp();
    }, 2000);
}

function onDeviceReady() {
    console.log('Device Ready - Global Radio App');
    setupBackgroundPlayback();
    setupHeadphoneControls();
}

function initializeApp() {
    loadSettings();
    loadFavorites();
    loadHistory();
    loadStats();
    setupEventListeners();
    populateLists();
    setupEqualizer();
    updateUI();
    checkAlarm();
    showToast('Welcome to Global Radio!', 'success');
}

// ========== SETUP FUNCTIONS ==========
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.addEventListener('click', () => switchView(btn.dataset.view));
    });
    
    // Player Controls
    document.getElementById('playPauseBtn').addEventListener('click', togglePlayPause);
    document.getElementById('skipBackBtn').addEventListener('click', skipBackward);
    document.getElementById('skipFwdBtn').addEventListener('click', skipForward);
    document.getElementById('volumeSlider').addEventListener('input', setVolume);
    document.getElementById('muteBtn').addEventListener('click', muteToggle);
    document.getElementById('progressBar').addEventListener('click', seekTo);
    
    // Secondary Controls
    document.getElementById('favBtn').addEventListener('click', toggleFavorite);
    document.getElementById('shareBtn').addEventListener('click', shareStation);
    document.getElementById('sleepTimerBtn').addEventListener('click', () => showView('sleepTimer'));
    document.getElementById('equalizerBtn').addEventListener('click', () => showView('equalizer'));
    document.getElementById('recordBtn').addEventListener('click', () => showView('recording'));
    
    // Search
    document.getElementById('searchToggle').addEventListener('click', toggleSearch);
    document.getElementById('searchInput').addEventListener('input', searchStations);
    document.getElementById('voiceSearchBtn').addEventListener('click', startVoiceSearch);
    
    // Filter chips
    document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => filterByCategory(chip.dataset.filter));
    });
    
    // Theme
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('darkModeToggle').addEventListener('change', toggleTheme);
    
    // Equalizer
    document.querySelectorAll('.eq-preset').forEach(preset => {
        preset.addEventListener('click', () => setEqualizerPreset(preset.dataset.preset));
    });
    document.querySelectorAll('.eq-slider').forEach(slider => {
        slider.addEventListener('input', () => updateEqualizer());
    });
    document.getElementById('resetEqBtn').addEventListener('click', resetEqualizer);
    
    // Sleep Timer
    document.querySelectorAll('.timer-option').forEach(opt => {
        opt.addEventListener('click', () => setSleepTimer(parseInt(opt.dataset.minutes)));
    });
    document.getElementById('cancelTimerBtn').addEventListener('click', cancelSleepTimer);
    
    // Alarm
    document.getElementById('setAlarmBtn').addEventListener('click', setAlarm);
    document.getElementById('cancelAlarmBtn').addEventListener('click', cancelAlarm);
    
    // Recording
    document.getElementById('startRecordingBtn').addEventListener('click', startRecording);
    document.getElementById('stopRecordingBtn').addEventListener('click', stopRecording);
    document.getElementById('stopRecordingModalBtn').addEventListener('click', stopRecording);
    
    // Settings
    document.getElementById('bgPlaybackToggle').addEventListener('change', (e) => setBackgroundPlayback(e.target.checked));
    document.getElementById('dataSaverToggle').addEventListener('change', (e) => setDataSaverMode(e.target.checked));
    document.getElementById('notificationsToggle').addEventListener('change', (e) => setNotifications(e.target.checked));
    document.getElementById('defaultBitrate').addEventListener('change', (e) => setDefaultBitrate(e.target.value));
    document.getElementById('clearCacheBtn').addEventListener('click', clearCache);
    document.getElementById('exportDataBtn').addEventListener('click', exportUserData);
    document.getElementById('resetAppBtn').addEventListener('click', resetApp);
}

function setupBackgroundPlayback() {
    if (window.cordova && window.cordova.plugins.backgroundMode) {
        window.cordova.plugins.backgroundMode.setDefaults({ title: 'Global Radio', text: 'Playing...' });
        window.cordova.plugins.backgroundMode.enable();
    }
}

function setupHeadphoneControls() {
    // Handle headphone button events
    if (window.MediaSession) {
        navigator.mediaSession.setActionHandler('play', () => play());
        navigator.mediaSession.setActionHandler('pause', () => pause());
        navigator.mediaSession.setActionHandler('previoustrack', () => skipBackward());
        navigator.mediaSession.setActionHandler('nexttrack', () => skipForward());
    }
}

// ========== CORE PLAYER FUNCTIONS (1-13) ==========
function playStation(station) {
    if (!station) return;
    
    currentStation = station;
    document.getElementById('currentStationName').innerText = station.name;
    document.getElementById('currentStationGenre').innerText = `${station.genre} | ${station.country}`;
    document.getElementById('npStationName').innerText = station.name;
    
    // Simulate playback (in production, use actual streaming)
    isPlaying = true;
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    document.getElementById('npPlayPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
    
    updateNowPlaying(`Playing: ${station.name}`);
    addToRecent(station);
    addToHistory(station);
    startVisualizer();
    showToast(`Now playing: ${station.name}`, 'success');
    
    // Update NP bar
    document.getElementById('npStationName').innerText = station.name;
    document.getElementById('npSongTitle').innerText = `Now playing`;
    
    // Fetch metadata
    setTimeout(() => {
        const songs = ['African Queen', 'Fall', 'Essence', 'Joro', 'On The Low'];
        const artists = ['2Baba', 'Davido', 'Wizkid', 'Burna Boy', 'Kizz Daniel'];
        const randomSong = songs[Math.floor(Math.random() * songs.length)];
        const randomArtist = artists[Math.floor(Math.random() * artists.length)];
        document.getElementById('currentSong').innerText = randomSong;
        document.getElementById('currentArtist').innerText = randomArtist;
        document.getElementById('npSongTitle').innerText = `${randomSong} - ${randomArtist}`;
    }, 3000);
    
    // Simulate progress
    startProgressSimulation();
}

function pauseStream() {
    isPlaying = false;
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    document.getElementById('npPlayPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    stopVisualizer();
    showToast('Playback paused', 'info');
}

function resumeStream() {
    if (currentStation) {
        isPlaying = true;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        document.getElementById('npPlayPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        startVisualizer();
        showToast('Resumed playback', 'success');
    }
}

function stopStream() {
    isPlaying = false;
    currentStation = null;
    document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    document.getElementById('npPlayPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
    document.getElementById('currentStationName').innerText = 'Select a Station';
    document.getElementById('npStationName').innerText = 'No station playing';
    document.getElementById('npSongTitle').innerText = 'Tap a station to start';
    stopVisualizer();
}

function togglePlayPause() {
    if (isPlaying) {
        pauseStream();
    } else {
        if (currentStation) {
            resumeStream();
        } else {
            showToast('Please select a station first', 'info');
        }
    }
}

function setVolume(level) {
    currentVolume = parseInt(level.target ? level.target.value : level);
    document.getElementById('volumeSlider').value = currentVolume;
    if (currentVolume === 0) {
        isMuted = true;
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        isMuted = false;
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
    }
    localStorage.setItem('volume', currentVolume);
}

function muteToggle() {
    isMuted = !isMuted;
    if (isMuted) {
        document.getElementById('volumeSlider').value = 0;
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-mute"></i>';
    } else {
        document.getElementById('volumeSlider').value = currentVolume;
        document.getElementById('muteBtn').innerHTML = '<i class="fas fa-volume-up"></i>';
    }
}

function getCurrentVolume() {
    return isMuted ? 0 : currentVolume;
}

function isCurrentlyPlaying() {
    return isPlaying;
}

function getCurrentStreamUrl() {
    return currentStation ? currentStation.streamUrl : null;
}

function skipForward() {
    if (!currentStation) return;
    showToast('Skipping forward', 'info');
    // Simulate changing song
    const songs = ['New Song Playing', 'Another Track', 'Fresh Beat'];
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    document.getElementById('currentSong').innerText = randomSong;
    document.getElementById('npSongTitle').innerText = randomSong;
    document.getElementById('progressFill').style.width = '0%';
    startProgressSimulation();
}

function skipBackward() {
    if (!currentStation) return;
    showToast('Skipping backward', 'info');
    const songs = ['Previous Track', 'Earlier Song', 'Last Played'];
    const randomSong = songs[Math.floor(Math.random() * songs.length)];
    document.getElementById('currentSong').innerText = randomSong;
    document.getElementById('npSongTitle').innerText = randomSong;
    document.getElementById('progressFill').style.width = '0%';
    startProgressSimulation();
}

function startProgressSimulation() {
    let progress = 0;
    const interval = setInterval(() => {
        if (isPlaying && progress < 100) {
            progress += 0.5;
            document.getElementById('progressFill').style.width = progress + '%';
            const currentTime = Math.floor((progress / 100) * 180);
            document.getElementById('currentTime').innerText = formatTime(currentTime);
            document.getElementById('duration').innerText = formatTime(180);
        } else if (!isPlaying || progress >= 100) {
            clearInterval(interval);
            if (progress >= 100) {
                document.getElementById('progressFill').style.width = '0%';
                const songs = ['Next Song Auto', 'New Track', 'Fresh Hit'];
                document.getElementById('currentSong').innerText = songs[Math.floor(Math.random() * songs.length)];
                startProgressSimulation();
            }
        }
    }, 500);
}

function seekTo(e) {
    const bar = e.currentTarget;
    const rect = bar.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = (x / rect.width) * 100;
    document.getElementById('progressFill').style.width = percentage + '%';
    const seekTime = Math.floor((percentage / 100) * 180);
    document.getElementById('currentTime').innerText = formatTime(seekTime);
}

// ========== STREAM MANAGEMENT (14-23) ==========
function loadStation(stationData) {
    playStation(stationData);
}

function switchStation(newStation) {
    if (isPlaying) {
        stopStream();
        playStation(newStation);
    } else {
        playStation(newStation);
    }
}

function reconnectStream() {
    if (currentStation && !isPlaying) {
        playStation(currentStation);
        showToast('Reconnected to stream', 'success');
    }
}

function getStreamBitrate() {
    return currentStation ? currentStation.bitrate : 0;
}

function getStreamFormat() {
    return 'MP3';
}

function checkStreamStatus(url) {
    return true; // Simulate online
}

function autoReconnect() {
    if (!isPlaying && currentStation) {
        setTimeout(() => reconnectStream(), 3000);
    }
}

function setMaxReconnectAttempts(attempts) {
    localStorage.setItem('maxReconnectAttempts', attempts);
}

function getBufferingProgress() {
    return isPlaying ? 100 : 0;
}

function clearStreamCache() {
    localStorage.removeItem('streamCache');
    showToast('Stream cache cleared', 'success');
}

// ========== EQUALIZER & AUDIO EFFECTS (24-33) ==========
function setupEqualizer() {
    eqSliders = {
        32: document.querySelector('.eq-slider[data-freq="32"]'),
        64: document.querySelector('.eq-slider[data-freq="64"]'),
        125: document.querySelector('.eq-slider[data-freq="125"]'),
        250: document.querySelector('.eq-slider[data-freq="250"]'),
        500: document.querySelector('.eq-slider[data-freq="500"]'),
        1000: document.querySelector('.eq-slider[data-freq="1000"]'),
        2000: document.querySelector('.eq-slider[data-freq="2000"]'),
        4000: document.querySelector('.eq-slider[data-freq="4000"]'),
        8000: document.querySelector('.eq-slider[data-freq="8000"]'),
        16000: document.querySelector('.eq-slider[data-freq="16000"]')
    };
}

function enableEqualizer() {
    localStorage.setItem('eqEnabled', 'true');
    showToast('Equalizer enabled', 'success');
}

function disableEqualizer() {
    localStorage.setItem('eqEnabled', 'false');
    resetEqualizer();
    showToast('Equalizer disabled', 'info');
}

function setEqualizerPreset(preset) {
    currentEqPreset = preset;
    document.querySelectorAll('.eq-preset').forEach(p => p.classList.remove('active'));
    document.querySelector(`.eq-preset[data-preset="${preset}"]`).classList.add('active');
    
    const presets = {
        normal: { 32:0, 64:0, 125:0, 250:0, 500:0, 1000:0, 2000:0, 4000:0, 8000:0, 16000:0 },
        rock: { 32:4, 64:3, 125:2, 250:0, 500:-1, 1000:-2, 2000:1, 4000:3, 8000:4, 16000:2 },
        pop: { 32:-2, 64:-1, 125:0, 250:2, 500:3, 1000:4, 2000:3, 4000:1, 8000:-1, 16000:-2 },
        jazz: { 32:2, 64:3, 125:3, 250:2, 500:1, 1000:0, 2000:1, 4000:2, 8000:3, 16000:2 },
        classical: { 32:1, 64:2, 125:3, 250:2, 500:1, 1000:0, 2000:1, 4000:2, 8000:3, 16000:4 },
        bass: { 32:6, 64:6, 125:5, 250:3, 500:0, 1000:0, 2000:-2, 4000:-2, 8000:-1, 16000:0 }
    };
    
    const values = presets[preset];
    for (const [freq, value] of Object.entries(values)) {
        if (eqSliders[freq]) {
            eqSliders[freq].value = value;
        }
    }
    updateEqualizer();
}

function setCustomEqualizer(frequencies) {
    for (const [freq, value] of Object.entries(frequencies)) {
        if (eqSliders[freq]) {
            eqSliders[freq].value = value;
        }
    }
    updateEqualizer();
}

function getEqualizerPresets() {
    return ['normal', 'rock', 'pop', 'jazz', 'classical', 'bass'];
}

function setBassBoost(level) {
    setEqualizerPreset('bass');
    showToast(`Bass boost: ${level}%`, 'info');
}

function setTrebleBoost(level) {
    const trebleBoost = { 8000: level/10, 16000: level/10 };
    setCustomEqualizer(trebleBoost);
    showToast(`Treble boost: ${level}%`, 'info');
}

function enableVirtualizer() {
    showToast('Virtual surround enabled', 'success');
}

function enableReverb() {
    showToast('Reverb effect enabled', 'success');
}

function resetEqualizer() {
    setEqualizerPreset('normal');
    showToast('Equalizer reset to default', 'info');
}

function updateEqualizer() {
    const values = {};
    for (const [freq, slider] of Object.entries(eqSliders)) {
        if (slider) values[freq] = parseInt(slider.value);
    }
    localStorage.setItem('eqSettings', JSON.stringify(values));
}

// ========== VISUALIZATION & METADATA (34-43) ==========
function getNowPlaying() {
    return {
        title: document.getElementById('currentSong').innerText,
        artist: document.getElementById('currentArtist').innerText
    };
}

function extractMetadata() {
    return getNowPlaying();
}

function getStationInfo() {
    return currentStation;
}

let visualizerCtx = null;
let visualizerCanvas = null;

function startVisualizer() {
    visualizerCanvas = document.getElementById('visualizer');
    if (!visualizerCanvas) return;
    
    visualizerCtx = visualizerCanvas.getContext('2d');
    
    function drawVisualizer() {
        if (!visualizerCtx || !isPlaying) return;
        
        const width = visualizerCanvas.width;
        const height = visualizerCanvas.height;
        visualizerCtx.clearRect(0, 0, width, height);
        
        const barCount = 50;
        const barWidth = width / barCount;
        
        for (let i = 0; i < barCount; i++) {
            const barHeight = Math.random() * height;
            const hue = (i / barCount) * 360;
            visualizerCtx.fillStyle = `hsl(${hue}, 100%, 50%)`;
            visualizerCtx.fillRect(i * barWidth, height - barHeight, barWidth - 2, barHeight);
        }
        
        animationId = requestAnimationFrame(drawVisualizer);
    }
    
    visualizerCanvas.width = visualizerCanvas.clientWidth;
    visualizerCanvas.height = visualizerCanvas.clientHeight;
    drawVisualizer();
}

function stopVisualizer() {
    if (animationId) {
        cancelAnimationFrame(animationId);
        animationId = null;
    }
    if (visualizerCtx && visualizerCanvas) {
        visualizerCtx.clearRect(0, 0, visualizerCanvas.width, visualizerCanvas.height);
    }
}

function getAlbumArt() {
    return currentStation ? currentStation.favicon : null;
}

function setAlbumArt(imageUrl) {
    if (currentStation) {
        currentStation.favicon = imageUrl;
        showToast('Album art updated', 'success');
    }
}

function enableSpectrumAnalyzer() {
    startVisualizer();
    showToast('Spectrum analyzer enabled', 'success');
}

function getListenerCount() {
    return currentStation ? currentStation.listeners : 0;
}

function getStationRating(stationId) {
    const station = stationsDB.find(s => s.id == stationId);
    return station ? Math.floor(Math.random() * 5) + 1 : 0;
}

function getStationVotes(stationId) {
    return Math.floor(Math.random() * 1000);
}

// ========== SEARCH & DISCOVERY (44-53) ==========
function searchStations() {
    const query = document.getElementById('searchInput').value.toLowerCase();
    if (query.length < 2) {
        document.getElementById('searchResultsList').innerHTML = '';
        return;
    }
    
    const results = stationsDB.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.country.toLowerCase().includes(query) ||
        station.genre.toLowerCase().includes(query) ||
        station.language.toLowerCase().includes(query) ||
        station.tags.some(tag => tag.includes(query))
    );
    
    displaySearchResults(results);
}

function searchByCountry(countryCode) {
    const countryMap = { 'ng': 'Nigeria', 'us': 'USA', 'uk': 'UK', 'fr': 'France', 'gh': 'Ghana' };
    const countryName = countryMap[countryCode.toLowerCase()] || countryCode;
    const results = stationsDB.filter(station => station.country === countryName);
    displayCategoryResults(results, `Stations in ${countryName}`);
    showView('category');
}

function searchByGenre(genre) {
    const results = stationsDB.filter(station => station.genre.toLowerCase().includes(genre.toLowerCase()));
    displayCategoryResults(results, `${genre} Stations`);
    showView('category');
}

function searchByLanguage(languageCode) {
    const langMap = { 'en': 'English', 'fr': 'French', 'es': 'Spanish', 'de': 'German', 'yo': 'Yoruba' };
    const language = langMap[languageCode.toLowerCase()] || languageCode;
    const results = stationsDB.filter(station => station.language === language);
    displayCategoryResults(results, `${language} Stations`);
    showView('category');
}

function getTopStations(limit = 10) {
    return stationsDB.slice(0, limit);
}

function getTrendingStations() {
    return stationsDB.sort((a, b) => b.listeners - a.listeners).slice(0, 5);
}

function getRecommendedStations() {
    if (!currentStation) return stationsDB.slice(0, 5);
    const recommendations = stationsDB.filter(s => 
        s.genre === currentStation.genre && s.id !== currentStation.id
    ).slice(0, 5);
    return recommendations.length ? recommendations : stationsDB.slice(0, 5);
}

function getNearbyStations(lat, lng) {
    // Simulate nearby stations based on country
    return stationsDB.filter(s => s.country === 'Nigeria').slice(0, 5);
}

function getNewStations(days) {
    return stationsDB.slice(-5);
}

function getRandomStation() {
    return stationsDB[Math.floor(Math.random() * stationsDB.length)];
}

function startVoiceSearch() {
    if ('webkitSpeechRecognition' in window) {
        const recognition = new webkitSpeechRecognition();
        recognition.continuous = false;
        recognition.lang = 'en-US';
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            document.getElementById('searchInput').value = transcript;
            searchStations();
        };
        recognition.start();
        showToast('Listening...', 'info');
    } else {
        showToast('Voice search not supported', 'error');
    }
}

function filterByCategory(filter) {
    let results = [];
    switch(filter) {
        case 'top':
            results = getTopStations(20);
            displaySearchResults(results);
            break;
        case 'country':
            showCountrySelector();
            break;
        case 'genre':
            showGenreSelector();
            break;
        default:
            displaySearchResults(stationsDB);
    }
}

function showCountrySelector() {
    const countries = ['Nigeria', 'USA', 'UK', 'France', 'Ghana', 'Italy', 'Germany'];
    let html = '<div class="category-grid">';
    countries.forEach(country => {
        html += `<button class="category-item" onclick="searchByCountry('${country}')">${country}</button>`;
    });
    html += '</div>';
    document.getElementById('searchResultsList').innerHTML = html;
}

function showGenreSelector() {
    const genres = ['Pop', 'Rock', 'Jazz', 'Hip Hop', 'Classical', 'News', 'Afrobeat'];
    let html = '<div class="category-grid">';
    genres.forEach(genre => {
        html += `<button class="category-item" onclick="searchByGenre('${genre}')">${genre}</button>`;
    });
    html += '</div>';
    document.getElementById('searchResultsList').innerHTML = html;
}

function displaySearchResults(results) {
    const container = document.getElementById('searchResultsList');
    if (!results.length) {
        container.innerHTML = '<div class="empty-state">No stations found</div>';
        return;
    }
    
    let html = '';
    results.forEach(station => {
        html += createStationItem(station);
    });
    container.innerHTML = html;
    attachStationEvents();
}

function displayCategoryResults(results, title) {
    document.getElementById('categoryTitle').innerText = title;
    const container = document.getElementById('categoryResultsList');
    if (!results.length) {
        container.innerHTML = '<div class="empty-state">No stations found</div>';
        return;
    }
    
    let html = '';
    results.forEach(station => {
        html += createStationItem(station);
    });
    container.innerHTML = html;
    attachStationEvents();
}

// ========== FAVORITES & LIBRARY (54-62) ==========
function loadFavorites() {
    const saved = localStorage.getItem('radioFavorites');
    if (saved) favorites = JSON.parse(saved);
    else favorites = [];
    updateFavoritesList();
}

function addToFavorites(station) {
    if (!favorites.find(f => f.id === station.id)) {
        favorites.push(station);
        localStorage.setItem('radioFavorites', JSON.stringify(favorites));
        updateFavoritesList();
        updateFavoriteButton(true);
        showToast(`Added ${station.name} to favorites`, 'success');
        updateStats();
    }
}

function removeFromFavorites(stationId) {
    favorites = favorites.filter(f => f.id != stationId);
    localStorage.setItem('radioFavorites', JSON.stringify(favorites));
    updateFavoritesList();
    updateFavoriteButton(false);
    showToast('Removed from favorites', 'info');
    updateStats();
}

function toggleFavorite() {
    if (!currentStation) {
        showToast('No station playing', 'error');
        return;
    }
    
    if (isFavorite(currentStation.id)) {
        removeFromFavorites(currentStation.id);
    } else {
        addToFavorites(currentStation);
    }
}

function getFavorites() {
    return favorites;
}

function isFavorite(stationId) {
    return favorites.some(f => f.id == stationId);
}

function reorderFavorites(fromIndex, toIndex) {
    const item = favorites.splice(fromIndex, 1)[0];
    favorites.splice(toIndex, 0, item);
    localStorage.setItem('radioFavorites', JSON.stringify(favorites));
    updateFavoritesList();
    showToast('Favorites reordered', 'success');
}

function exportFavorites() {
    const dataStr = JSON.stringify(favorites, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio_favorites_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Favorites exported!', 'success');
}

function importFavorites(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            favorites = imported;
            localStorage.setItem('radioFavorites', JSON.stringify(favorites));
            updateFavoritesList();
            showToast('Favorites imported!', 'success');
        } catch (err) {
            showToast('Invalid file', 'error');
        }
    };
    reader.readAsText(file);
}

function syncFavoritesToCloud() {
    showToast('Sync feature coming soon', 'info');
}

function clearFavorites() {
    if (confirm('Clear all favorites?')) {
        favorites = [];
        localStorage.setItem('radioFavorites', JSON.stringify(favorites));
        updateFavoritesList();
        showToast('All favorites cleared', 'info');
    }
}

function updateFavoritesList() {
    const container = document.getElementById('favoritesList');
    if (!favorites.length) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-heart-broken"></i><p>No favorites yet</p></div>';
        document.getElementById('totalFavorites').innerText = '0';
        return;
    }
    
    let html = '';
    favorites.forEach(station => {
        html += createStationItem(station);
    });
    container.innerHTML = html;
    attachStationEvents();
    document.getElementById('totalFavorites').innerText = favorites.length;
}

function updateFavoriteButton(isFav) {
    const favBtn = document.getElementById('favBtn');
    if (isFav) {
        favBtn.innerHTML = '<i class="fas fa-heart"></i> Favorited';
        favBtn.style.color = '#e94560';
    } else {
        favBtn.innerHTML = '<i class="fas fa-heart"></i> Favorite';
        favBtn.style.color = 'inherit';
    }
}

// ========== RECENT & HISTORY (63-72) ==========
function loadHistory() {
    const saved = localStorage.getItem('radioHistory');
    if (saved) history = JSON.parse(saved);
    else history = [];
    updateHistoryList();
}

function addToHistory(station) {
    history.unshift({...station, playedAt: new Date().toISOString()});
    if (history.length > 50) history.pop();
    localStorage.setItem('radioHistory', JSON.stringify(history));
    updateHistoryList();
    updateTotalListeningTime();
}

function addToRecent(station) {
    recentStations = recentStations.filter(s => s.id !== station.id);
    recentStations.unshift(station);
    if (recentStations.length > 10) recentStations.pop();
    updateRecentList();
}

function getRecentStations(limit = 10) {
    return recentStations.slice(0, limit);
}

function clearRecentHistory() {
    recentStations = [];
    updateRecentList();
    showToast('Recent history cleared', 'info');
}

function getMostPlayed(limit = 5) {
    const playCount = {};
    history.forEach(h => {
        playCount[h.id] = (playCount[h.id] || 0) + 1;
    });
    const sorted = Object.entries(playCount).sort((a,b) => b[1] - a[1]).slice(0, limit);
    return sorted.map(([id, count]) => {
        const station = stationsDB.find(s => s.id == id);
        return { ...station, playCount: count };
    });
}

function getListeningTime() {
    return totalListeningMinutes;
}

function getDailyStats() {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days.map(day => Math.floor(Math.random() * 60));
}

function getWeeklyStats() {
    return getDailyStats();
}

function getFavoriteGenre() {
    if (!history.length) return 'Pop';
    const genreCount = {};
    history.forEach(h => {
        const station = stationsDB.find(s => s.id === h.id);
        if (station) genreCount[station.genre] = (genreCount[station.genre] || 0) + 1;
    });
    const topGenre = Object.entries(genreCount).sort((a,b) => b[1] - a[1])[0];
    return topGenre ? topGenre[0] : 'Pop';
}

function getPeakListeningHour() {
    const hourCount = {};
    history.forEach(h => {
        const hour = new Date(h.playedAt).getHours();
        hourCount[hour] = (hourCount[hour] || 0) + 1;
    });
    const peakHour = Object.entries(hourCount).sort((a,b) => b[1] - a[1])[0];
    return peakHour ? `${peakHour[0]}:00` : '20:00';
}

function exportListeningHistory() {
    const dataStr = JSON.stringify(history, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio_history_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('History exported!', 'success');
}

function updateHistoryList() {
    const container = document.getElementById('historyList');
    if (!history.length) {
        container.innerHTML = '<div class="empty-state">No listening history yet</div>';
        return;
    }
    
    let html = '';
    history.slice(0, 20).forEach(entry => {
        const date = new Date(entry.playedAt);
        html += createStationItem(entry, `Played: ${date.toLocaleString()}`);
    });
    container.innerHTML = html;
    attachStationEvents();
}

function updateRecentList() {
    const container = document.getElementById('recentList');
    if (!recentStations.length) {
        container.innerHTML = '<div class="empty-state">No recent stations</div>';
        return;
    }
    
    let html = '';
    recentStations.forEach(station => {
        html += createStationItem(station);
    });
    container.innerHTML = html;
    attachStationEvents();
}

// ========== SLEEP TIMER (73-81) ==========
function setSleepTimer(minutes) {
    cancelSleepTimer();
    const endTime = Date.now() + (minutes * 60 * 1000);
    sleepTimerEndTime = endTime;
    localStorage.setItem('sleepTimerEnd', endTime);
    
    sleepTimerInterval = setInterval(() => {
        const remaining = sleepTimerEndTime - Date.now();
        if (remaining <= 0) {
            cancelSleepTimer();
            stopStream();
            showToast('Sleep timer: Radio turned off', 'info');
            document.getElementById('sleepTimerDisplay').innerHTML = '';
        } else {
            const minsLeft = Math.ceil(remaining / 60000);
            document.getElementById('sleepTimerDisplay').innerHTML = `💤 Sleep: ${minsLeft} min left`;
        }
    }, 1000);
    
    showToast(`Sleep timer set for ${minutes} minutes`, 'success');
}

function cancelSleepTimer() {
    if (sleepTimerInterval) {
        clearInterval(sleepTimerInterval);
        sleepTimerInterval = null;
    }
    sleepTimerEndTime = null;
    localStorage.removeItem('sleepTimerEnd');
    document.getElementById('sleepTimerDisplay').innerHTML = '';
}

function getRemainingSleepTime() {
    if (!sleepTimerEndTime) return 0;
    return Math.max(0, Math.ceil((sleepTimerEndTime - Date.now()) / 60000));
}

function scheduleStation(station, dateTime) {
    const scheduledTime = new Date(dateTime).getTime();
    const now = Date.now();
    if (scheduledTime <= now) {
        showToast('Scheduled time must be in the future', 'error');
        return;
    }
    
    const timeoutId = setTimeout(() => {
        playStation(station);
        showToast(`Now playing: ${station.name} (scheduled)`, 'success');
    }, scheduledTime - now);
    
    localStorage.setItem(`scheduled_${scheduledTime}`, JSON.stringify({ station, timeoutId }));
    showToast(`Scheduled ${station.name} for ${new Date(scheduledTime).toLocaleString()}`, 'success');
}

function getScheduledStations() {
    const schedules = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('scheduled_')) {
            schedules.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    return schedules;
}

function cancelSchedule(scheduleId) {
    const data = localStorage.getItem(`scheduled_${scheduleId}`);
    if (data) {
        const { timeoutId } = JSON.parse(data);
        clearTimeout(timeoutId);
        localStorage.removeItem(`scheduled_${scheduleId}`);
        showToast('Schedule cancelled', 'info');
    }
}

function enableAlarmMode() {
    showToast('Alarm mode enabled', 'success');
}

function setAlarmTime(time) {
    alarmTime = time;
    localStorage.setItem('alarmTime', time);
    showToast(`Alarm set for ${time}`, 'success');
}

function snoozeAlarm(minutes) {
    if (alarmTime) {
        const [hour, minute] = alarmTime.split(':');
        const newDate = new Date();
        newDate.setHours(parseInt(hour), parseInt(minute) + minutes, 0);
        alarmTime = `${newDate.getHours().toString().padStart(2,'0')}:${newDate.getMinutes().toString().padStart(2,'0')}`;
        localStorage.setItem('alarmTime', alarmTime);
        showToast(`Snoozed for ${minutes} minutes`, 'info');
    }
}

function setAlarm() {
    const time = document.getElementById('alarmTime').value;
    const stationId = document.getElementById('alarmStation').value;
    if (!time) {
        showToast('Please select a time', 'error');
        return;
    }
    
    alarmTime = time;
    if (stationId) {
        currentAlarmStation = stationsDB.find(s => s.id == stationId);
    }
    localStorage.setItem('alarmTime', alarmTime);
    localStorage.setItem('alarmStationId', stationId);
    startAlarmChecker();
    showToast(`Alarm set for ${alarmTime}`, 'success');
}

function cancelAlarm() {
    if (alarmInterval) {
        clearInterval(alarmInterval);
        alarmInterval = null;
    }
    alarmTime = null;
    currentAlarmStation = null;
    localStorage.removeItem('alarmTime');
    localStorage.removeItem('alarmStationId');
    document.getElementById('alarmStatus').innerHTML = 'No alarm set';
    showToast('Alarm cancelled', 'info');
}

function startAlarmChecker() {
    if (alarmInterval) clearInterval(alarmInterval);
    alarmInterval = setInterval(() => {
        if (!alarmTime) return;
        const now = new Date();
        const currentTime = `${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}`;
        if (currentTime === alarmTime) {
            if (currentAlarmStation) {
                playStation(currentAlarmStation);
            } else if (currentStation) {
                playStation(currentStation);
            }
            showToast('⏰ Alarm! Good morning!', 'success');
            cancelAlarm();
        }
    }, 30000);
}

function checkAlarm() {
    const savedTime = localStorage.getItem('alarmTime');
    const savedStationId = localStorage.getItem('alarmStationId');
    if (savedTime) {
        alarmTime = savedTime;
        if (savedStationId) {
            currentAlarmStation = stationsDB.find(s => s.id == savedStationId);
        }
        startAlarmChecker();
        document.getElementById('alarmStatus').innerHTML = `Alarm set for ${alarmTime}`;
    }
}

// ========== BACKGROUND & NOTIFICATION (82-89) ==========
function enableBackgroundPlayback() {
    backgroundPlayback = true;
    if (window.cordova && window.cordova.plugins.backgroundMode) {
        window.cordova.plugins.backgroundMode.enable();
    }
    showToast('Background playback enabled', 'success');
}

function showNotification() {
    if (!notificationsEnabled) return;
    
    if (window.cordova && window.cordova.plugins.notification) {
        window.cordova.plugins.notification.local.schedule({
            title: 'Global Radio',
            text: currentStation ? `Now playing: ${currentStation.name}` : 'Tap to open',
            foreground: true
        });
    }
}

function updateNotificationMetadata() {
    const nowPlaying = getNowPlaying();
    if (window.cordova && window.cordova.plugins.backgroundMode) {
        window.cordova.plugins.backgroundMode.setDefaults({
            title: currentStation?.name || 'Global Radio',
            text: nowPlaying.title ? `${nowPlaying.title} - ${nowPlaying.artist}` : 'Playing...'
        });
    }
}

function hideNotification() {
    if (window.cordova && window.cordova.plugins.notification) {
        window.cordova.plugins.notification.local.clearAll();
    }
}

function setupLockScreenControls() {
    if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
            title: currentStation?.name || 'Global Radio',
            artist: getNowPlaying().artist,
            album: 'Live Radio'
        });
    }
}

function handleHeadphoneControls() {
    // Handled in setupHeadphoneControls
}

function enablePictureInPicture() {
    if (document.pictureInPictureEnabled) {
        const video = document.createElement('video');
        video.srcObject = new MediaStream();
        video.requestPictureInPicture();
        showToast('Picture-in-picture mode enabled', 'success');
    } else {
        showToast('PiP not supported', 'error');
    }
}

function closePictureInPicture() {
    if (document.exitPictureInPicture) {
        document.exitPictureInPicture();
    }
}

// ========== NETWORK & CONNECTION (90-98) ==========
function checkInternetConnection() {
    return navigator.onLine;
}

function getConnectionType() {
    if (!navigator.onLine) return 'none';
    // In Cordova, use navigator.connection.type
    return navigator.connection ? navigator.connection.type : 'unknown';
}

function setDataSaverMode(enabled) {
    dataSaverMode = enabled;
    localStorage.setItem('dataSaverMode', enabled);
    showToast(`Data saver mode ${enabled ? 'enabled' : 'disabled'}`, 'info');
}

function getDataUsage() {
    const usage = localStorage.getItem('dataUsage') || 0;
    return Math.round(usage / 1024 / 1024); // MB
}

function resetDataCounter() {
    localStorage.setItem('dataUsage', 0);
    showToast('Data counter reset', 'info');
}

function setMaxBitrateOnCellular(bitrate) {
    localStorage.setItem('cellularBitrate', bitrate);
    showToast(`Cellular bitrate limit: ${bitrate} kbps`, 'info');
}

function preloadStationOnWiFi(stationId) {
    const station = stationsDB.find(s => s.id == stationId);
    if (station && getConnectionType() === 'wifi') {
        localStorage.setItem(`preload_${stationId}`, JSON.stringify(station));
        showToast(`Preloaded ${station.name}`, 'success');
    }
}

function getPreloadedStations() {
    const preloaded = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('preload_')) {
            preloaded.push(JSON.parse(localStorage.getItem(key)));
        }
    }
    return preloaded;
}

function clearCache() {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('preload_')) {
            size += localStorage.getItem(key).length;
            localStorage.removeItem(key);
        }
    }
    cacheSize = 0;
    document.getElementById('cacheSize').innerText = '0 MB';
    showToast(`Cleared ${Math.round(size/1024)} KB cache`, 'success');
}

// ========== RECORDING & SHARING (99-106) ==========
function startRecording() {
    if (!currentStation || !isPlaying) {
        showToast('Play a station first', 'error');
        return;
    }
    
    recordingStartTime = Date.now();
    document.getElementById('recordingStatus').innerHTML = '🔴 Recording...';
    document.getElementById('startRecordingBtn').disabled = true;
    document.getElementById('stopRecordingBtn').disabled = false;
    document.getElementById('recordingDialog').classList.remove('hidden');
    
    recordingInterval = setInterval(() => {
        const elapsed = Math.floor((Date.now() - recordingStartTime) / 1000);
        document.getElementById('recordingTimer').innerText = formatTime(elapsed);
    }, 1000);
    
    showToast('Recording started', 'info');
}

function stopRecording() {
    if (!recordingStartTime) return;
    
    clearInterval(recordingInterval);
    const duration = Math.floor((Date.now() - recordingStartTime) / 1000);
    recordingStartTime = null;
    
    document.getElementById('recordingStatus').innerHTML = 'Ready to record';
    document.getElementById('startRecordingBtn').disabled = false;
    document.getElementById('stopRecordingBtn').disabled = true;
    document.getElementById('recordingDialog').classList.add('hidden');
    
    // Save recording info
    const recording = {
        id: Date.now(),
        station: currentStation,
        duration: duration,
        date: new Date().toISOString()
    };
    
    const recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    recordings.push(recording);
    localStorage.setItem('recordings', JSON.stringify(recordings));
    
    updateRecordingsList();
    showToast(`Recording saved (${formatTime(duration)})`, 'success');
}

function getRecordings() {
    return JSON.parse(localStorage.getItem('recordings') || '[]');
}

function playRecording(filePath) {
    showToast('Play recording feature - would play saved audio', 'info');
}

function deleteRecording(recordingId) {
    let recordings = JSON.parse(localStorage.getItem('recordings') || '[]');
    recordings = recordings.filter(r => r.id != recordingId);
    localStorage.setItem('recordings', JSON.stringify(recordings));
    updateRecordingsList();
    showToast('Recording deleted', 'info');
}

function shareRecording(recordingId) {
    const recording = JSON.parse(localStorage.getItem('recordings') || '[]').find(r => r.id == recordingId);
    if (recording && navigator.share) {
        navigator.share({
            title: 'Radio Recording',
            text: `Recorded from ${recording.station.name}`,
        });
    } else {
        showToast('Share not available', 'error');
    }
}

function shareStation() {
    if (!currentStation) {
        showToast('No station playing', 'error');
        return;
    }
    
    if (navigator.share) {
        navigator.share({
            title: currentStation.name,
            text: `Listening to ${currentStation.name} on Global Radio!`,
            url: currentStation.streamUrl
        });
    } else {
        navigator.clipboard.writeText(`Check out ${currentStation.name} on Global Radio!`);
        showToast('Link copied to clipboard!', 'success');
    }
}

function generateStationQRCode(station) {
    showToast('QR code feature coming soon', 'info');
}

function updateRecordingsList() {
    const recordings = getRecordings();
    const container = document.getElementById('recordingsList');
    if (!recordings.length) {
        container.innerHTML = '<div class="empty-state">No recordings yet</div>';
        return;
    }
    
    let html = '';
    recordings.slice(-5).reverse().forEach(rec => {
        const date = new Date(rec.date);
        html += `
            <div class="recording-item">
                <div>
                    <strong>${rec.station.name}</strong><br>
                    <small>${formatTime(rec.duration)} | ${date.toLocaleString()}</small>
                </div>
                <div>
                    <button onclick="deleteRecording(${rec.id})" class="small-btn">🗑️</button>
                </div>
            </div>
        `;
    });
    container.innerHTML = html;
}

// ========== SETTINGS & PREFERENCES (107-115) ==========
function loadSettings() {
    const volume = localStorage.getItem('volume');
    if (volume) setVolume(parseInt(volume));
    
    const theme = localStorage.getItem('theme');
    if (theme === 'light') enableLightMode();
    
    const bgPlayback = localStorage.getItem('bgPlayback') !== 'false';
    document.getElementById('bgPlaybackToggle').checked = bgPlayback;
    
    const dataSaver = localStorage.getItem('dataSaverMode') === 'true';
    document.getElementById('dataSaverToggle').checked = dataSaver;
    
    const notif = localStorage.getItem('notificationsEnabled') !== 'false';
    document.getElementById('notificationsToggle').checked = notif;
    
    const bitrate = localStorage.getItem('defaultBitrate') || '128';
    document.getElementById('defaultBitrate').value = bitrate;
    
    updateCacheSize();
}

function setDefaultVolume(level) {
    localStorage.setItem('volume', level);
    setVolume(level);
}

function setDefaultStation(stationId) {
    const station = stationsDB.find(s => s.id == stationId);
    if (station) {
        localStorage.setItem('defaultStation', JSON.stringify(station));
        showToast(`Default station set to ${station.name}`, 'success');
    }
}

function setTheme(themeName) {
    if (themeName === 'dark') {
        document.body.classList.remove('light-mode');
        localStorage.setItem('theme', 'dark');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-moon"></i>';
    } else {
        document.body.classList.add('light-mode');
        localStorage.setItem('theme', 'light');
        document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
    }
}

function toggleTheme() {
    const isLight = document.body.classList.contains('light-mode');
    setTheme(isLight ? 'dark' : 'light');
}

function enableLightMode() {
    document.body.classList.add('light-mode');
    document.getElementById('themeToggle').innerHTML = '<i class="fas fa-sun"></i>';
}

function setLanguage(languageCode) {
    localStorage.setItem('language', languageCode);
    showToast(`Language set to ${languageCode}`, 'info');
}

function enableAutoStart() {
    const defaultStation = localStorage.getItem('defaultStation');
    if (defaultStation) {
        playStation(JSON.parse(defaultStation));
    }
}

function setBufferingThreshold(seconds) {
    localStorage.setItem('bufferThreshold', seconds);
    showToast(`Buffer threshold: ${seconds}s`, 'info');
}

function resetAllSettings() {
    if (confirm('Reset all settings to default?')) {
        localStorage.clear();
        loadSettings();
        setVolume(70);
        setTheme('dark');
        showToast('All settings reset', 'success');
        location.reload();
    }
}

function exportSettings() {
    const settings = {
        volume: currentVolume,
        theme: localStorage.getItem('theme'),
        bgPlayback: backgroundPlayback,
        dataSaver: dataSaverMode,
        notifications: notificationsEnabled,
        defaultBitrate: currentBitrate,
        eqSettings: localStorage.getItem('eqSettings'),
        favorites: favorites
    };
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio_settings_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Settings exported!', 'success');
}

function importSettings(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const settings = JSON.parse(e.target.result);
            if (settings.volume) setVolume(settings.volume);
            if (settings.theme) setTheme(settings.theme);
            if (settings.favorites) favorites = settings.favorites;
            localStorage.setItem('radioFavorites', JSON.stringify(favorites));
            updateFavoritesList();
            showToast('Settings imported!', 'success');
        } catch (err) {
            showToast('Invalid file', 'error');
        }
    };
    reader.readAsText(file);
}

function setBackgroundPlayback(enabled) {
    backgroundPlayback = enabled;
    localStorage.setItem('bgPlayback', enabled);
    if (enabled && window.cordova) {
        window.cordova.plugins.backgroundMode.enable();
    } else if (window.cordova) {
        window.cordova.plugins.backgroundMode.disable();
    }
}

function setNotifications(enabled) {
    notificationsEnabled = enabled;
    localStorage.setItem('notificationsEnabled', enabled);
}

function setDefaultBitrate(bitrate) {
    currentBitrate = parseInt(bitrate);
    localStorage.setItem('defaultBitrate', bitrate);
    showToast(`Default bitrate: ${bitrate} kbps`, 'info');
}

function updateCacheSize() {
    let size = 0;
    for (let i = 0; i < localStorage.length; i++) {
        size += localStorage.getItem(localStorage.key(i)).length;
    }
    cacheSize = Math.round(size / 1024);
    document.getElementById('cacheSize').innerText = `${cacheSize} KB`;
}

// ========== ANALYTICS & STATISTICS (116-123) ==========
function loadStats() {
    totalListeningMinutes = parseInt(localStorage.getItem('totalListeningMinutes') || '0');
    lastListenDate = localStorage.getItem('lastListenDate');
    updateStatsDisplay();
}

function updateTotalListeningTime() {
    totalListeningMinutes += 5; // Simulate 5 minutes per listen
    localStorage.setItem('totalListeningMinutes', totalListeningMinutes);
    const today = new Date().toDateString();
    if (lastListenDate === today) {
        // Continue streak
    } else if (lastListenDate && new Date(lastListenDate).getTime() + 86400000 > Date.now()) {
        listeningStreak++;
    } else {
        listeningStreak = 1;
    }
    lastListenDate = today;
    localStorage.setItem('lastListenDate', lastListenDate);
    localStorage.setItem('listeningStreak', listeningStreak);
    updateStatsDisplay();
}

function getTotalListeningTime() {
    return totalListeningMinutes;
}

function getUniqueStationsListened() {
    const unique = new Set(history.map(h => h.id));
    return unique.size;
}

function getTopGenres() {
    const genreCount = {};
    history.forEach(h => {
        const station = stationsDB.find(s => s.id === h.id);
        if (station) genreCount[station.genre] = (genreCount[station.genre] || 0) + 1;
    });
    return genreCount;
}

function getListeningTrend() {
    const lastWeek = getDailyStats();
    const prevWeek = getDailyStats();
    const currentTotal = lastWeek.reduce((a,b) => a+b, 0);
    const prevTotal = prevWeek.reduce((a,b) => a+b, 0);
    return prevTotal ? ((currentTotal - prevTotal) / prevTotal) * 100 : 0;
}

function getDailyAverageMinutes() {
    return Math.round(totalListeningMinutes / (Object.keys(history).length || 1));
}

function getBestDay() {
    const dayCount = { Sunday:0, Monday:0, Tuesday:0, Wednesday:0, Thursday:0, Friday:0, Saturday:0 };
    history.forEach(h => {
        const day = new Date(h.playedAt).toLocaleDateString('en', { weekday: 'long' });
        dayCount[day]++;
    });
    const bestDay = Object.entries(dayCount).sort((a,b) => b[1] - a[1])[0];
    return bestDay ? { day: bestDay[0], minutes: bestDay[1] * 5 } : { day: 'Monday', minutes: 0 };
}

function generateListeningReport() {
    const report = {
        generated: new Date().toISOString(),
        totalMinutes: totalListeningMinutes,
        uniqueStations: getUniqueStationsListened(),
        topGenre: getFavoriteGenre(),
        peakHour: getPeakListeningHour(),
        streak: listeningStreak,
        topStations: getMostPlayed(5)
    };
    const dataStr = JSON.stringify(report, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio_report_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report generated!', 'success');
}

function shareListeningStats() {
    const stats = `🎵 My Global Radio Stats:\n📊 Total listening: ${totalListeningMinutes} minutes\n🎧 Stations: ${getUniqueStationsListened()}\n🔥 Streak: ${listeningStreak} days\n🎵 Top genre: ${getFavoriteGenre()}`;
    if (navigator.share) {
        navigator.share({ text: stats });
    } else {
        copyToClipboard(stats);
    }
}

function updateStatsDisplay() {
    document.getElementById('totalListeningTime').innerText = totalListeningMinutes;
    document.getElementById('uniqueStations').innerText = getUniqueStationsListened();
    document.getElementById('topGenre').innerText = getFavoriteGenre();
    document.getElementById('peakHour').innerText = getPeakListeningHour();
    document.getElementById('streakDays').innerText = listeningStreak || 1;
    document.getElementById('uniqueStations').innerText = getUniqueStationsListened();
    
    // Update chart
    updateListeningChart();
}

function updateListeningChart() {
    const ctx = document.getElementById('listeningChart');
    if (!ctx) return;
    
    const dailyData = getDailyStats();
    if (chart) chart.destroy();
    
    chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Listening Minutes',
                data: dailyData,
                borderColor: '#e94560',
                backgroundColor: 'rgba(233,69,96,0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom' }
            }
        }
    });
}

function updateStats() {
    updateStatsDisplay();
}

// ========== APP LIFECYCLE & ERROR HANDLING (124-130) ==========
function initPlayer() {
    console.log('Player initialized');
    loadSettings();
    setupEqualizer();
}

function destroyPlayer() {
    if (isPlaying) stopStream();
    if (sleepTimerInterval) clearInterval(sleepTimerInterval);
    if (alarmInterval) clearInterval(alarmInterval);
    if (recordingInterval) clearInterval(recordingInterval);
    stopVisualizer();
}

function handleStreamError(error) {
    console.error('Stream error:', error);
    showToast('Stream error. Trying to reconnect...', 'error');
    setTimeout(() => reconnectStream(), 3000);
}

function logError(error) {
    const errors = JSON.parse(localStorage.getItem('errorLogs') || '[]');
    errors.push({ error: error.toString(), time: new Date().toISOString() });
    if (errors.length > 20) errors.shift();
    localStorage.setItem('errorLogs', JSON.stringify(errors));
}

function showErrorMessage(message) {
    showToast(message, 'error');
}

function isStreamAccessible(url) {
    return true; // Simulate
}

function getFallbackStream(url) {
    return url; // Return same URL as fallback
}

// ========== IMPORT/EXPORT & BACKUP (131-135) ==========
function backupAllData() {
    const backup = {
        favorites: favorites,
        history: history,
        settings: {
            volume: currentVolume,
            theme: localStorage.getItem('theme'),
            bgPlayback: backgroundPlayback,
            eqSettings: localStorage.getItem('eqSettings')
        },
        stats: {
            totalMinutes: totalListeningMinutes,
            streak: listeningStreak
        },
        timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(backup, null, 2);
    const blob = new Blob([dataStr], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `radio_backup_${new Date().toISOString().slice(0,10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup created!', 'success');
}

function restoreBackup(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const backup = JSON.parse(e.target.result);
            if (backup.favorites) {
                favorites = backup.favorites;
                localStorage.setItem('radioFavorites', JSON.stringify(favorites));
                updateFavoritesList();
            }
            if (backup.history) {
                history = backup.history;
                localStorage.setItem('radioHistory', JSON.stringify(history));
                updateHistoryList();
            }
            if (backup.settings) {
                if (backup.settings.volume) setVolume(backup.settings.volume);
                if (backup.settings.theme) setTheme(backup.settings.theme);
                if (backup.settings.eqSettings) localStorage.setItem('eqSettings', backup.settings.eqSettings);
            }
            showToast('Backup restored!', 'success');
            location.reload();
        } catch (err) {
            showToast('Invalid backup file', 'error');
        }
    };
    reader.readAsText(file);
}

function exportFavoritesAsPlaylist() {
    let m3uContent = '#EXTM3U\n';
    favorites.forEach(station => {
        m3uContent += `#EXTINF:-1,${station.name}\n${station.streamUrl}\n`;
    });
    const blob = new Blob([m3uContent], {type: 'audio/x-mpegurl'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'radio_favorites.m3u';
    a.click();
    URL.revokeObjectURL(url);
    showToast('Playlist exported!', 'success');
}

function importM3UPlaylist(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const content = e.target.result;
        const lines = content.split('\n');
        const importedStations = [];
        let currentStation = null;
        
        for (const line of lines) {
            if (line.startsWith('#EXTINF')) {
                const match = line.match(/#EXTINF:-1,(.+)/);
                if (match) currentStation = { name: match[1], streamUrl: '', genre: 'Imported', country: 'Unknown' };
            } else if (line.startsWith('http') && currentStation) {
                currentStation.streamUrl = line;
                currentStation.id = Date.now() + Math.random();
                importedStations.push(currentStation);
                currentStation = null;
            }
        }
        
        importedStations.forEach(s => {
            if (!favorites.find(f => f.streamUrl === s.streamUrl)) {
                favorites.push(s);
            }
        });
        localStorage.setItem('radioFavorites', JSON.stringify(favorites));
        updateFavoritesList();
        showToast(`Imported ${importedStations.length} stations`, 'success');
    };
    reader.readAsText(file);
}

function syncAcrossDevices() {
    showToast('Cloud sync coming soon', 'info');
}

function exportUserData() {
    backupAllData();
}

function resetApp() {
    if (confirm('Are you sure? This will delete ALL your data!'
