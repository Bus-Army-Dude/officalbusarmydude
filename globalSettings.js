// globalSettings.js (Corrected Version with Accent Color)

class GlobalSettings {
    constructor() {
        // Load settings immediately from localStorage
        this.settings = this.loadSettingsInternalOnly();

        // Defer DOM-related initialization until the DOM is ready
        document.addEventListener('DOMContentLoaded', () => {
            console.log("DOM loaded, initializing GlobalSettings DOM interactions...");
            this.initDOMRelated(); // Initialize DOM elements and apply initial styles
            this.initFontSizeControls(); // Initialize slider if present
            this.startObserver(); // Start observing for DOM changes after initial setup
        });

        // Set up storage listener immediately (doesn't require DOM)
        this.initStorageListener();
    }

    /**
     * Loads settings from localStorage ONLY. Does not interact with DOM.
     * @returns {object} The loaded settings or default settings.
     */
    loadSettingsInternalOnly() {
        const defaultSettings = {
            darkMode: true,
            fontSize: 14,
            accentColor: '#007bff', // ✨ ADDED: Default accent color
            lastUpdate: Date.now()
        };
        const savedSettings = localStorage.getItem('websiteSettings');
        try {
            const settings = savedSettings ? JSON.parse(savedSettings) : defaultSettings;
            // Basic validation
            settings.darkMode = typeof settings.darkMode === 'boolean' ? settings.darkMode : defaultSettings.darkMode;
            settings.fontSize = typeof settings.fontSize === 'number' && settings.fontSize >= 12 && settings.fontSize <= 24 ? settings.fontSize : defaultSettings.fontSize;
            settings.accentColor = typeof settings.accentColor === 'string' ? settings.accentColor : defaultSettings.accentColor; // ✨ ADDED: Validation
            return settings;
        } catch (e) {
            console.error("Error parsing settings from localStorage, using defaults.", e);
            return defaultSettings;
        }
    }

    /**
     * Initializes DOM-related settings application *after* DOM is loaded.
     */
    initDOMRelated() {
        // Apply settings now that elements exist
        this.applyDarkMode(this.settings.darkMode);
        this.applyFontSize(this.settings.fontSize);
        this.applyAccentColor(this.settings.accentColor); // ✨ ADDED
    }

    /**
     * Sets up the listener for changes in localStorage across tabs.
     */
    initStorageListener() {
        window.addEventListener('storage', (e) => {
            if (e.key === 'websiteSettings') {
                console.log("Storage event detected for websiteSettings.");
                try {
                    const newSettings = JSON.parse(e.newValue);
                    if (newSettings) {
                        this.settings = newSettings; // Update internal settings
                        this.applyAllSettings();     // Apply changes visually
                        this.updateFontSizeSliderDisplay(); // Update slider if controls exist
                    }
                } catch (err) {
                    console.error("Error parsing settings from storage event:", err);
                }
            }
        });
    }

    // ... (Your other methods like initFontSizeControls, updateFontSizeSliderDisplay, updateSliderGradient are perfect as they are)
    initFontSizeControls() {
        const textSizeSlider = document.getElementById('text-size-slider');
        const textSizeValue = document.getElementById('textSizeValue');
        if (textSizeSlider && textSizeValue) {
            console.log("Font size controls found, initializing.");
            this.updateFontSizeSliderDisplay();
            textSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value, 10);
                if (!isNaN(size)) {
                    this.applyFontSize(size);
                    if(textSizeValue) textSizeValue.textContent = `${size}px`;
                    this.updateSliderGradient(textSizeSlider);
                }
            });
        } else {
            console.log("Font size slider controls not found on this page.");
        }
    }
    updateFontSizeSliderDisplay() {
        const textSizeSlider = document.getElementById('text-size-slider');
        const textSizeValue = document.getElementById('textSizeValue');
        if (textSizeSlider && textSizeValue) {
            try{
                textSizeSlider.value = this.settings.fontSize;
                textSizeValue.textContent = `${this.settings.fontSize}px`;
                this.updateSliderGradient(textSizeSlider);
            } catch(e){
                console.error("Error updating font size slider display:", e);
            }
        }
    }
    updateSliderGradient(slider) {
        if (!slider || typeof slider.min === 'undefined' || typeof slider.max === 'undefined') return;
        try{
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const val = parseFloat(slider.value);
            if(isNaN(min) || isNaN(max) || isNaN(val) || max <= min) return;
            const percentage = ((val - min) * 100) / (max - min);
            slider.style.setProperty('--slider-value', `${percentage}%`);
        } catch(e) {
            console.error("Error updating slider gradient:", e);
        }
    }


    /**
     * Applies the specified accent color by setting a CSS custom property.
     * @param {string} color - The color code (e.g., '#RRGGBB').
     */
    // ✨ ADDED: New method for accent color
    applyAccentColor(color) {
        if (typeof color !== 'string' || !color.startsWith('#')) return; // Basic validation
        document.documentElement.style.setProperty('--accent-color', color);
        console.log(`GlobalSettings: Applied accent color: ${color}`);

        if (this.settings.accentColor !== color) {
            this.settings.accentColor = color;
            this.settings.lastUpdate = Date.now();
            this.saveSettings();
        }
    }

    /**
     * Applies the specified font size by setting a CSS custom property on the root element.
     * @param {number} size - The base font size in pixels.
     */
    applyFontSize(size) {
        const cleanSize = Math.min(Math.max(parseInt(size, 10) || 16, 12), 24);
        document.documentElement.style.setProperty('--font-size-base', `${cleanSize}px`);
        // console.log(`GlobalSettings: Applied font size: ${cleanSize}px`); // Log is good for debugging
        if (this.settings.fontSize !== cleanSize) {
            this.settings.fontSize = cleanSize;
            this.settings.lastUpdate = Date.now();
            this.saveSettings();
        }
    }

    /**
     * Toggles dark mode on/off.
     * @param {boolean} isDark - True to enable dark mode, false for light mode.
     */
    applyDarkMode(isDark) {
        if (typeof isDark !== 'boolean') return;
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        if (this.settings.darkMode !== isDark) {
            this.settings.darkMode = isDark;
            this.settings.lastUpdate = Date.now();
            this.saveSettings();
        }
    }

    /**
     * Applies all current settings (dark mode, font size, accent color).
     */
    applyAllSettings() {
        console.log("Applying all settings from GlobalSettings...");
        this.applyDarkMode(this.settings.darkMode);
        this.applyFontSize(this.settings.fontSize);
        this.applyAccentColor(this.settings.accentColor); // ✨ ADDED
    }

    /**
     * Saves the current settings object to localStorage.
     */
    saveSettings() {
        try {
            localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
        } catch (e) {
            console.error("Error saving settings to localStorage:", e);
        }
    }

    // ... (Your startObserver method is also perfect as is)
    startObserver() {
        console.log("Starting MutationObserver for font size adjustments.");
        try {
            const observer = new MutationObserver((mutations) => {
                let nodesAdded = false;
                mutations.forEach((mutation) => {
                    if (mutation.addedNodes.length) {
                        nodesAdded = true;
                    }
                });
                if(nodesAdded) {
                    this.applyFontSize(this.settings.fontSize);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
            console.log("MutationObserver started.");
        } catch (e) {
            console.error("Failed to start MutationObserver:", e);
        }
    }

} // End of GlobalSettings class

// --- Initialize the Global Settings ---
try {
    // This instance will be accessible globally, so other scripts can use it.
    var globalSettings = new GlobalSettings();
    console.log("GlobalSettings instance created.");
} catch(e) {
    console.error("Failed to initialize GlobalSettings:", e);
}
