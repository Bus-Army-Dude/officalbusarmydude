/**
 * settings.js
 * Manages all website settings including appearance (theme), font size, and focus outline.
 * It loads settings from localStorage, applies them to the page,
 * and saves any changes made by the user.
 */
class SettingsManager {
    constructor() {
        // Default settings for the website
        this.defaultSettings = {
            appearanceMode: 'device', // Options: 'device', 'dark', 'light'
            fontSize: 16,             // Default font size in pixels
            focusOutline: 'disabled', // Options: 'enabled', 'disabled'
            hoverAnimations: 'enabled', // NEW: 'enabled', 'disabled'
            scrollToTopButton: 'enabled',// NEW: 'enabled', 'disabled'
        };

        // Load current settings from localStorage or use defaults
        this.settings = this.loadSettings();
        this.deviceThemeMedia = null; // To store the media query list for OS theme changes

        // Defer DOM-related initialization until the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log("SettingsManager: DOMContentLoaded. Initializing UI controls and applying settings.");
            this.initializeControls();      // Set up UI elements based on loaded settings
            this.applyAllSettings();        // Apply all visual settings
            this.setupEventListeners();     // Add event listeners for user interactions

            // Listen for changes in the operating system's theme preference
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this._boundDeviceThemeChangeHandler = this.handleDeviceThemeChange.bind(this);
                this.deviceThemeMedia.addEventListener('change', this._boundDeviceThemeChangeHandler);
            }

            // Listen for settings changes made in other tabs
            this._boundStorageHandler = this.handleStorageChange.bind(this);
            window.addEventListener('storage', this._boundStorageHandler);
        });
    }

    /**
     * Loads settings from localStorage, falling back to defaults if invalid.
     * @returns {object} The loaded or default settings.
     */
    loadSettings() {
        try {
            const storedSettings = localStorage.getItem('websiteSettings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Merge saved settings with defaults to ensure new settings are added
                return { ...this.defaultSettings, ...parsedSettings };
            }
        } catch (error) {
            console.error("SettingsManager: Error loading settings from localStorage. Using defaults.", error);
        }
        return { ...this.defaultSettings }; // Return a copy of defaults
    }

    /**
     * Validates the font size to ensure it's within the allowed range.
     * @param {*} size - The font size to validate.
     * @returns {number} The validated font size, or the default if invalid.
     */
    validateFontSize(size) {
        const parsedSize = parseInt(size, 10);
        return (isNaN(parsedSize) || parsedSize < 12 || parsedSize > 24) ? this.defaultSettings.fontSize : parsedSize;
    }

    /**
     * Initializes the UI controls on the settings page to reflect current settings.
     */
    initializeControls() {
        // Appearance Mode Segmented Control
        const appearanceModeControl = document.getElementById('appearanceModeControl');
        if (appearanceModeControl) {
            appearanceModeControl.querySelectorAll('button').forEach(button => button.classList.remove('active'));
            const activeButton = appearanceModeControl.querySelector(`button[data-value="${this.settings.appearanceMode}"]`);
            if (activeButton) activeButton.classList.add('active');
        }

        // Text Size Slider
        const textSizeSlider = document.getElementById('text-size-slider');
        const textSizeValueDisplay = document.getElementById('textSizeValue');
        if (textSizeSlider && textSizeValueDisplay) {
            textSizeSlider.value = this.settings.fontSize;
            textSizeValueDisplay.textContent = `${this.settings.fontSize}px`;
            this.updateSliderGradient(textSizeSlider);
        }

        // Focus Outline Toggle
        const focusOutlineToggle = document.getElementById('focusOutlineToggle');
        if (focusOutlineToggle) {
            focusOutlineToggle.checked = this.settings.focusOutline === 'enabled';
        }

        // NEW: Hover Animations Toggle
        const hoverAnimationsToggle = document.getElementById('hoverAnimationsToggle');
        if (hoverAnimationsToggle) {
            hoverAnimationsToggle.checked = this.settings.hoverAnimations === 'enabled';
        }
        
        // NEW: Scroll to Top Button Toggle
        const scrollToTopToggle = document.getElementById('scrollToTopToggle');
        if (scrollToTopToggle) {
            scrollToTopToggle.checked = this.settings.scrollToTopButton === 'enabled';
        }
    }

    /**
     * Sets up event listeners for the UI controls on the settings page.
     */
    setupEventListeners() {
        // Appearance Mode Segmented Control
        const appearanceModeControl = document.getElementById('appearanceModeControl');
        if (appearanceModeControl) {
            appearanceModeControl.addEventListener('click', (event) => {
                const clickedButton = event.target.closest('button');
                if (clickedButton && !clickedButton.classList.contains('active')) {
                    this.settings.appearanceMode = clickedButton.dataset.value;
                    this.applyAppearanceMode();
                    this.saveSettings();
                    this.initializeControls(); // Re-initialize to update UI state
                }
            });
        }

        // Text Size Slider
        const textSizeSlider = document.getElementById('text-size-slider');
        if (textSizeSlider) {
            textSizeSlider.addEventListener('input', (event) => {
                this.settings.fontSize = this.validateFontSize(event.target.value);
                this.applyFontSize();
                this.saveSettings();
                this.initializeControls();
            });
        }

        // Focus Outline Toggle
        const focusOutlineToggle = document.getElementById('focusOutlineToggle');
        if (focusOutlineToggle) {
            focusOutlineToggle.addEventListener('change', (event) => {
                this.settings.focusOutline = event.target.checked ? 'enabled' : 'disabled';
                this.applyFocusOutline();
                this.saveSettings();
            });
        }
        
        // NEW: Hover Animations Toggle
        const hoverAnimationsToggle = document.getElementById('hoverAnimationsToggle');
        if (hoverAnimationsToggle) {
            hoverAnimationsToggle.addEventListener('change', (event) => {
                this.settings.hoverAnimations = event.target.checked ? 'enabled' : 'disabled';
                this.applyHoverAnimations();
                this.saveSettings();
            });
        }

        // NEW: Scroll to Top Button Toggle
        const scrollToTopToggle = document.getElementById('scrollToTopToggle');
        if (scrollToTopToggle) {
            scrollToTopToggle.addEventListener('change', (event) => {
                this.settings.scrollToTopButton = event.target.checked ? 'enabled' : 'disabled';
                this.applyScrollToTopButton();
                this.saveSettings();
            });
        }

        // Reset Settings Button
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetSettings());
        }
    }

    /**
     * Applies all current settings to the page.
     */
    applyAllSettings() {
        this.applyAppearanceMode();
        this.applyFontSize();
        this.applyFocusOutline();
        this.applyHoverAnimations(); // NEW
        this.applyScrollToTopButton(); // NEW
    }

    // --- Individual Apply Methods ---

    applyAppearanceMode() {
        const body = document.body;
        let isDarkMode = this.settings.appearanceMode === 'dark' || (this.settings.appearanceMode === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        body.classList.toggle('dark-mode', isDarkMode);
        body.classList.toggle('light-mode', !isDarkMode);
    }

    applyFontSize() {
        document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`);
    }

    applyFocusOutline() {
        document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled');
    }

    applyHoverAnimations() {
        document.body.classList.toggle('hover-animations-disabled', this.settings.hoverAnimations === 'disabled');
    }
    
    applyScrollToTopButton() {
        document.body.classList.toggle('scroll-to-top-disabled', this.settings.scrollToTopButton === 'disabled');
    }

    // --- Event Handlers & Core Methods ---

    handleDeviceThemeChange() {
        if (this.settings.appearanceMode === 'device') {
            this.applyAppearanceMode();
        }
    }

    handleStorageChange(event) {
        if (event.key === 'websiteSettings') {
            this.settings = this.loadSettings();
            this.initializeControls();
            this.applyAllSettings();
        }
    }

    saveSettings() {
        try {
            localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error("Error saving settings to localStorage:", error);
        }
    }

    resetSettings() {
        this.settings = { ...this.defaultSettings };
        this.initializeControls();
        this.applyAllSettings();
        this.saveSettings();
    }

    updateSliderGradient(slider) {
        if (!slider) return;
        const percentage = ((slider.value - slider.min) * 100) / (slider.max - slider.min);
        slider.style.setProperty('--slider-value-percentage', `${percentage}%`);
    }
}

// Ensures only one instance of SettingsManager is created.
if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
}

