/**
 * settings.js
 * Manages all website settings including appearance (theme), font size, focus outline, and motion effects.
 * It loads settings from localStorage, applies them to the page,
 * and saves any changes made by the user.
 */
class SettingsManager {
    constructor() {
        // Default settings for the website
        this.defaultSettings = {
            appearanceMode: 'device', // Options: 'device', 'dark', 'light'
            fontSize: 20,             // Default font size in pixels
            focusOutline: 'disabled', // Options: 'enabled', 'disabled'
            motionEffects: 'enabled', // Correct property for motion
        };

        // Load current settings from localStorage or use defaults
        this.settings = this.loadSettings();
        this.deviceThemeMedia = null;

        document.addEventListener('DOMContentLoaded', () => {
            console.log("SettingsManager: DOMContentLoaded. Initializing UI controls and applying settings.");
            this.initializeControls();
            this.applyAllSettings();
            this.setupEventListeners();

            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this._boundDeviceThemeChangeHandler = this.handleDeviceThemeChange.bind(this);
                this.deviceThemeMedia.addEventListener('change', this._boundDeviceThemeChangeHandler);
            }

            this._boundStorageHandler = this.handleStorageChange.bind(this);
            window.addEventListener('storage', this._boundStorageHandler);
        });
    }

    loadSettings() {
        try {
            const storedSettings = localStorage.getItem('websiteSettings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Merge with defaults to ensure all keys are present
                return { ...this.defaultSettings, ...parsedSettings };
            }
        } catch (error) {
            console.error("SettingsManager: Error loading settings from localStorage. Using defaults.", error);
        }
        return { ...this.defaultSettings };
    }

    validateFontSize(size) {
        const parsedSize = parseInt(size, 10);
        return (isNaN(parsedSize) || parsedSize < 12 || parsedSize > 24) ? this.defaultSettings.fontSize : parsedSize;
    }

    initializeControls() {
        // Appearance Mode Control
        const appearanceModeControl = document.getElementById('appearanceModeControl');
        if (appearanceModeControl) {
            appearanceModeControl.querySelectorAll('button').forEach(button => {
                button.classList.remove('active');
                if (button.dataset.value === this.settings.appearanceMode) {
                    button.classList.add('active');
                }
            });
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

        // Motion & Effects Toggle
        const motionEffectsToggle = document.getElementById('hoverAnimationsToggle');
        if (motionEffectsToggle) {
            motionEffectsToggle.checked = this.settings.motionEffects === 'enabled';
        }
    }

    setupEventListeners() {
        // Appearance Mode Control
        const appearanceModeControl = document.getElementById('appearanceModeControl');
        if (appearanceModeControl) {
            appearanceModeControl.addEventListener('click', (event) => {
                const clickedButton = event.target.closest('button');
                if (clickedButton && !clickedButton.classList.contains('active')) {
                    this.settings.appearanceMode = clickedButton.dataset.value;
                    this.applyAppearanceMode();
                    this.saveSettings();
                    this.initializeControls();
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

        // Motion & Effects Toggle
        const motionEffectsToggle = document.getElementById('hoverAnimationsToggle');
        if (motionEffectsToggle) {
            motionEffectsToggle.addEventListener('change', (event) => {
                this.settings.motionEffects = event.target.checked ? 'enabled' : 'disabled';
                this.applyMotionEffects();
                this.saveSettings();
            });
        }

        // Reset Settings Button
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetSettings());
        }
    }

    applyAllSettings() {
        this.applyAppearanceMode();
        this.applyFontSize();
        this.applyFocusOutline();
        this.applyMotionEffects();
    }

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

    applyMotionEffects() {
        document.body.classList.toggle('motion-disabled', this.settings.motionEffects === 'disabled');
    }

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
        if (confirm('Are you sure you want to reset all settings to their defaults? This action cannot be undone.')) {
            this.settings = { ...this.defaultSettings };
            this.initializeControls();
            this.applyAllSettings();
            this.saveSettings();
            alert('Settings have been reset to their default values.');
        }
    }

    updateSliderGradient(slider) {
        if (!slider) return;
        const percentage = ((slider.value - slider.min) * 100) / (slider.max - slider.min);
        slider.style.setProperty('--slider-value-percentage', `${percentage}%`);
    }
}

if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
}
