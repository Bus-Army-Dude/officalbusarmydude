class SettingsManager {
    constructor() {
        this.defaultSettings = {
            appearanceMode: 'device', // device | dark | light
            fontSize: 16,
            focusOutline: 'disabled',
            lastUpdated: Date.now()
        };

        this.currentUser = 'BusArmyDude';
        this.settings = this.loadSettings();
        this.updateInterval = null;

        // Initialize everything
        this.initializeControls();
        this.applySettings();
        this.setupEventListeners();
        this.startTimeUpdate();
        this.displayUserInfo();
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('websiteSettings');
            if (stored) {
                const parsed = JSON.parse(stored);
                return {
                    appearanceMode: ['device', 'dark', 'light'].includes(parsed.appearanceMode)
                        ? parsed.appearanceMode
                        : this.defaultSettings.appearanceMode,
                    fontSize: this.validateFontSize(parsed.fontSize),
                    focusOutline: ['enabled', 'disabled'].includes(parsed.focusOutline)
                        ? parsed.focusOutline
                        : this.defaultSettings.focusOutline,
                    lastUpdated: Date.now()
                };
            }
        } catch (error) {
            console.error("Error loading settings:", error);
        }
        return { ...this.defaultSettings };
    }

    validateFontSize(size) {
        const parsed = parseInt(size);
        if (isNaN(parsed) || parsed < 12 || parsed > 24) {
            return this.defaultSettings.fontSize;
        }
        return parsed;
    }

    initializeControls() {
        const appearanceModeSelect = document.getElementById('appearanceModeSelect');
        if (appearanceModeSelect) {
            appearanceModeSelect.value = this.settings.appearanceMode;
        }

        const textSizeSlider = document.getElementById('text-size-slider');
        const textSizeValue = document.getElementById('textSizeValue');
        if (textSizeSlider && textSizeValue) {
            textSizeSlider.value = this.settings.fontSize;
            textSizeValue.textContent = `${this.settings.fontSize}px`;
        }

        const focusOutlineToggle = document.getElementById('focusOutlineToggle');
        if (focusOutlineToggle) {
            focusOutlineToggle.checked = this.settings.focusOutline === 'enabled';
        }

        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }

    setupEventListeners() {
        const appearanceModeSelect = document.getElementById('appearanceModeSelect');
        if (appearanceModeSelect) {
            appearanceModeSelect.addEventListener('change', (e) => {
                this.settings.appearanceMode = e.target.value;
                this.applySettings();
                this.saveSettings();
            });
        }

        const textSizeSlider = document.getElementById('text-size-slider');
        if (textSizeSlider) {
            textSizeSlider.addEventListener('input', (e) => {
                const size = parseInt(e.target.value);
                this.settings.fontSize = size;
                document.getElementById('textSizeValue').textContent = `${size}px`;
                this.applySettings();
                this.saveSettings();
            });
        }

        const focusOutlineToggle = document.getElementById('focusOutlineToggle');
        if (focusOutlineToggle) {
            focusOutlineToggle.addEventListener('change', (e) => {
                this.settings.focusOutline = e.target.checked ? 'enabled' : 'disabled';
                this.applySettings();
                this.saveSettings();
            });
        }

        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetSettings());
        }

        // Listen for system theme changes (for device mode)
        this._deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
        this._deviceThemeMedia.addEventListener('change', e => {
            if (this.settings.appearanceMode === 'device') {
                this.applySettings();
            }
        });

        window.addEventListener('storage', (e) => {
            if (e.key === 'websiteSettings') {
                this.settings = JSON.parse(e.newValue);
                this.initializeControls();
                this.applySettings();
            }
        });

        window.addEventListener('unload', () => this.cleanup());
    }

    startTimeUpdate() {
        const updateTimeDisplay = () => {
            const now = new Date();
            const timeString = now.toISOString()
                .replace('T', ' ')
                .substring(0, 19);

            const timeElements = document.querySelectorAll('.current-datetime');
            timeElements.forEach(element => {
                element.textContent = `Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${timeString}`;
            });
        };

        updateTimeDisplay();
        this.updateInterval = setInterval(updateTimeDisplay, 1000);
    }

    displayUserInfo() {
        const userElements = document.querySelectorAll('.current-user');
        userElements.forEach(element => {
            element.textContent = `Current User's Login: ${this.currentUser}`;
        });
    }

    applySettings() {
        // Remove both theme classes first, then apply as needed
        document.body.classList.remove('light-mode', 'dark-mode');

        let mode;
        switch (this.settings.appearanceMode) {
            case 'dark':
                mode = 'dark-mode';
                break;
            case 'light':
                mode = 'light-mode';
                break;
            case 'device':
            default:
                mode = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark-mode' : 'light-mode';
                break;
        }
        document.body.classList.add(mode);

        // Font Size
        document.documentElement.style.setProperty('--base-font-size', `${this.settings.fontSize}px`);
        this.updateTextSize();

        // Focus Outline
        document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled');
    }

    updateTextSize() {
        const elements = document.querySelectorAll('body, h1, h2, h3, h4, h5, h6, p, span, a, button, input, textarea, label');
        const baseSize = this.settings.fontSize;

        elements.forEach(element => {
            let scale = 1;
            switch (element.tagName.toLowerCase()) {
                case 'h1': scale = 2; break;
                case 'h2': scale = 1.75; break;
                case 'h3': scale = 1.5; break;
                case 'h4': scale = 1.25; break;
                case 'h5': scale = 1.15; break;
                case 'h6': scale = 1.1; break;
                default: scale = 1;
            }
            element.style.fontSize = `${baseSize * scale}px`;
        });
    }

    saveSettings() {
        try {
            this.settings.lastUpdated = Date.now();
            localStorage.setItem('websiteSettings', JSON.stringify(this.settings));

            window.dispatchEvent(new CustomEvent('settingsChanged', {
                detail: this.settings
            }));
        } catch (error) {
            console.error("Error saving settings:", error);
        }
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their defaults?')) {
            this.settings = { ...this.defaultSettings };
            this.initializeControls();
            this.applySettings();
            this.saveSettings();
            alert('Settings have been reset to defaults.');
        }
    }

    cleanup() {
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        if (this._deviceThemeMedia) {
            this._deviceThemeMedia.removeEventListener('change', this.applySettings);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    window.settingsManager = new SettingsManager();
});
