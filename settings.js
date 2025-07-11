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
            focusOutline: 'disabled', // Options: 'enabled', 'disabled' (as per existing CSS logic)
        };

        // Load current settings from localStorage or use defaults
        this.settings = this.loadSettings();
        this.deviceThemeMedia = null; // To store the media query list for OS theme changes

        // Defer DOM-related initialization until the DOM is fully loaded
        document.addEventListener('DOMContentLoaded', () => {
            console.log("SettingsManager: DOMContentLoaded. Initializing UI controls and applying settings.");
            this.initializeControls();      // Set up UI elements (dropdowns, sliders) based on loaded settings
            this.applyAllSettings();        // Apply all visual settings (theme, font, focus)
            this.setupEventListeners();     // Add event listeners for user interactions with settings controls
            
            // ADDED: Initialize the new interactive toggle functionality
            this.initializeInteractiveToggles();

            // Listen for changes in the operating system's theme preference
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this._boundDeviceThemeChangeHandler = this.handleDeviceThemeChange.bind(this);
                this.deviceThemeMedia.addEventListener('change', this._boundDeviceThemeChangeHandler);
            }

            // Listen for settings changes made in other tabs or windows
            this._boundStorageHandler = this.handleStorageChange.bind(this);
            window.addEventListener('storage', this._boundStorageHandler);

            // Dynamically set the current year in the footer
            const yearElement = document.getElementById('year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        });
    }

    /**
     * Loads settings from localStorage.
     */
    loadSettings() {
        try {
            const storedSettings = localStorage.getItem('websiteSettings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Validate and merge with defaults to ensure all keys are present
                const validatedSettings = {
                    appearanceMode: ['device', 'dark', 'light'].includes(parsedSettings.appearanceMode) ? parsedSettings.appearanceMode : this.defaultSettings.appearanceMode,
                    fontSize: this.validateFontSize(parsedSettings.fontSize),
                    focusOutline: ['enabled', 'disabled'].includes(parsedSettings.focusOutline) ? parsedSettings.focusOutline : this.defaultSettings.focusOutline,
                };
                return validatedSettings;
            }
        } catch (error) {
            console.error("SettingsManager: Error loading settings from localStorage. Using defaults.", error);
        }
        return { ...this.defaultSettings };
    }

    /**
     * Validates the font size.
     */
    validateFontSize(size) {
        const parsedSize = parseInt(size, 10);
        return (!isNaN(parsedSize) && parsedSize >= 12 && parsedSize <= 24) ? parsedSize : this.defaultSettings.fontSize;
    }
    
    /**
     * Saves the current settings to localStorage.
     */
    saveSettings() {
        try {
            localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
        } catch (error) {
            console.error("SettingsManager: Error saving settings to localStorage:", error);
        }
    }

    /**
     * Initializes the UI controls to reflect the currently loaded settings.
     */
    initializeControls() {
        document.getElementById('appearanceModeSelect').value = this.settings.appearanceMode;
        const textSizeSlider = document.getElementById('text-size-slider');
        if (textSizeSlider) {
            textSizeSlider.value = this.settings.fontSize;
            document.getElementById('textSizeValue').textContent = `${this.settings.fontSize}px`;
            this.updateSliderGradient(textSizeSlider);
        }
        document.getElementById('focusOutlineToggle').checked = this.settings.focusOutline === 'enabled';
    }

    /**
     * Sets up event listeners for the UI controls.
     */
    setupEventListeners() {
        document.getElementById('appearanceModeSelect').addEventListener('change', (event) => {
            this.settings.appearanceMode = event.target.value;
            this.applyAppearanceMode();
            this.saveSettings();
        });

        const textSizeSlider = document.getElementById('text-size-slider');
        textSizeSlider.addEventListener('input', (event) => {
            const newSize = this.validateFontSize(event.target.value);
            this.settings.fontSize = newSize;
            document.getElementById('textSizeValue').textContent = `${newSize}px`;
            this.applyFontSize();
            this.updateSliderGradient(textSizeSlider);
        });
        // Save font size setting only when user stops sliding
        textSizeSlider.addEventListener('change', () => this.saveSettings());


        document.getElementById('focusOutlineToggle').addEventListener('change', (event) => {
            this.settings.focusOutline = event.target.checked ? 'enabled' : 'disabled';
            this.applyFocusOutline();
            this.saveSettings();
        });

        document.getElementById('resetSettings').addEventListener('click', () => this.resetSettings());
    }

    /**
     * Applies all current settings to the page.
     */
    applyAllSettings() {
        this.applyAppearanceMode();
        this.applyFontSize();
        this.applyFocusOutline();
    }

    applyAppearanceMode() {
        const body = document.body;
        let isDarkMode = this.settings.appearanceMode === 'dark' || 
                         (this.settings.appearanceMode === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        body.classList.toggle('dark-mode', isDarkMode);
        body.classList.toggle('light-mode', !isDarkMode);
    }

    applyFontSize() {
        document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`);
    }

    applyFocusOutline() {
        document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled');
    }

    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their defaults?')) {
            this.settings = { ...this.defaultSettings };
            this.initializeControls();
            this.applyAllSettings();
            this.saveSettings();
            alert('Settings have been reset.');
        }
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

    updateSliderGradient(slider) {
        if (!slider) return;
        const percentage = ((slider.value - slider.min) * 100) / (slider.max - slider.min);
        slider.style.setProperty('--slider-value-percentage', `${percentage}%`);
    }

    /**
     * NEW: Activates advanced interactive toggles with long-press and drag functionality.
     */
    initializeInteractiveToggles() {
        document.querySelectorAll('.interactive-toggle').forEach(toggleLabel => {
            const checkbox = toggleLabel.querySelector('input[type="checkbox"]');
            const bubble = toggleLabel.querySelector('.toggle-bubble');
            const bubbleThumb = toggleLabel.querySelector('.toggle-bubble-thumb');
            if (!checkbox || !bubble || !bubbleThumb) return;

            let longPressTimer, isDragging = false, startX = 0;

            const handleLongPress = (e) => {
                e.preventDefault();
                isDragging = true;
                toggleLabel.classList.add('long-press-active');
                if (checkbox.checked) {
                    toggleLabel.classList.add('toggled-on');
                    bubbleThumb.style.left = `${bubble.offsetWidth - bubbleThumb.offsetWidth - 10}px`;
                } else {
                    toggleLabel.classList.remove('toggled-on');
                    bubbleThumb.style.left = '0px';
                }
                startX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            };

            const handleDragMove = (e) => {
                if (!isDragging) return;
                const moveX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
                let deltaX = moveX - startX;
                const maxDrag = bubble.offsetWidth - bubbleThumb.offsetWidth - 10;
                const initialLeft = toggleLabel.classList.contains('toggled-on') ? maxDrag : 0;
                let newLeft = Math.max(0, Math.min(initialLeft + deltaX, maxDrag));
                bubbleThumb.style.transition = 'none';
                bubbleThumb.style.left = `${newLeft}px`;
                checkbox.checked = newLeft > maxDrag / 2;
            };

            const handleDragEnd = () => {
                if (isDragging) {
                    isDragging = false;
                    toggleLabel.classList.remove('long-press-active');
                    const maxDrag = bubble.offsetWidth - bubbleThumb.offsetWidth - 10;
                    const currentLeft = parseFloat(bubbleThumb.style.left) || 0;
                    checkbox.checked = currentLeft > maxDrag / 2;
                    checkbox.dispatchEvent(new Event('change', { bubbles: true }));
                    bubbleThumb.style.transition = '';
                    bubbleThumb.style.left = '';
                }
                clearTimeout(longPressTimer);
            };

            const handlePressStart = (e) => {
                e.preventDefault();
                longPressTimer = setTimeout(() => handleLongPress(e), 400);
            };

            toggleLabel.addEventListener('mousedown', handlePressStart);
            toggleLabel.addEventListener('touchstart', handlePressStart, { passive: false });
            window.addEventListener('mousemove', handleDragMove);
            window.addEventListener('touchmove', handleDragMove, { passive: false });
            window.addEventListener('mouseup', handleDragEnd);
            window.addEventListener('touchend', handleDragEnd);
            toggleLabel.addEventListener('mouseup', () => clearTimeout(longPressTimer));
            toggleLabel.addEventListener('mouseleave', () => clearTimeout(longPressTimer));
            toggleLabel.addEventListener('touchend', () => clearTimeout(longPressTimer));
        });
    }
}

// Ensures that only one instance of SettingsManager is created and used globally.
if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
    console.log("SettingsManager: Instance created and attached to window.");
}
