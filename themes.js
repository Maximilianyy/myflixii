const themes = {
    default: {
        background: '#0f0f0f',
        surface: '#1a1a1a',
        primary: '#e50914',
        text: '#ffffff',
        textSecondary: '#9e9e9e'
    },
    blue: {
        background: '#0a192f',
        surface: '#172a45',
        primary: '#0066ff',
        text: '#ffffff',
        textSecondary: '#8892b0'
    },
    mint: {
        background: '#0a2f1f',
        surface: '#1a4332',
        primary: '#00b894',
        text: '#ffffff',
        textSecondary: '#90b0a0'
    },
    lavender: {
        background: '#1a142f',
        surface: '#2a2045',
        primary: '#9c88ff',
        text: '#ffffff',
        textSecondary: '#b088ff'
    }
};

function applyTheme(themeName) {
    const theme = themes[themeName];
    const root = document.documentElement;
    
    // Apply theme colors to CSS variables
    Object.keys(theme).forEach(key => {
        root.style.setProperty(`--${key}`, theme[key]);
    });
    
    // Save theme preference
    localStorage.setItem('selectedTheme', themeName);
}

// Load saved theme or use default
function initTheme() {
    const savedTheme = localStorage.getItem('selectedTheme') || 'default';
    applyTheme(savedTheme);
}

// Initialize theme when page loads
document.addEventListener('DOMContentLoaded', initTheme);
document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("selectedTheme") || "darkTheme";
    setTheme(savedTheme);
});

function setTheme(theme) {
    console.log("Theme geändert zu:", theme); // Debugging-Ausgabe  
    document.body.classList.add("transition");
    document.body.className = theme; 
    localStorage.setItem("selectedTheme", theme);

    // Sofortige Aktualisierung der Einstellungsseite
    applyThemeToSettingsPage(theme);

    setTimeout(() => document.body.classList.remove("transition"), 500);
}

// Aktualisiert die Einstellungsseite mit einer etwas dunkleren Farbe
function applyThemeToSettingsPage(theme) {
    const settingsPage = document.querySelector(".settings-container");
    if (settingsPage) {
        settingsPage.style.backgroundColor = getDarkerThemeColor(theme);
        settingsPage.style.transition = "background-color 0.5s ease";
        console.log("Einstellungsseite aktualisiert:", theme);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const savedTheme = localStorage.getItem("selectedTheme") || "darkTheme";
    setTheme(savedTheme);
});

function setTheme(theme) {
    console.log("Theme geändert zu:", theme);  
    document.body.classList.add("transition");
    document.body.className = theme; 
    localStorage.setItem("selectedTheme", theme);

    // Die gesamte Einstellungsseite anpassen
    applyThemeToSettingsPage(theme);

    setTimeout(() => document.body.classList.remove("transition"), 500);
}

function applyThemeToSettingsPage(theme) {
    const settingsPage = document.querySelector(".settings-container");
    if (settingsPage) {
        settingsPage.style.backgroundColor = getThemeColor(theme);
        settingsPage.style.color = getTextColor(theme); // Textfarbe ändern für bessere Lesbarkeit
        settingsPage.style.transition = "background-color 0.5s ease, color 0.5s ease";
        console.log("Einstellungsseite aktualisiert:", theme);
    }
}

// Gibt die passende Theme-Farbe zurück
function getThemeColor(theme) {
    const themeColors = {
        darkTheme: "#181818",
        blueTheme: "#007bff",
        mintTheme: "#3eb489",
        lavenderTheme: "#9370db"
    };
    return themeColors[theme] || "#181818"; 
}

// Automatische Anpassung der Textfarbe je nach Theme
function getTextColor(theme) {
    return theme === "darkTheme" ? "#ffffff" : "#f0f0f0"; 
}
