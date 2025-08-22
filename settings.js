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

            // Listen for changes in the operating system's theme preference
            // This is relevant when the website's appearanceMode is set to 'device'
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                // Store the bound listener function so it can be correctly removed later if needed
                this._boundDeviceThemeChangeHandler = this.handleDeviceThemeChange.bind(this);
                this.deviceThemeMedia.addEventListener('change', this._boundDeviceThemeChangeHandler);
            }

            // Listen for settings changes made in other tabs or windows of the same website
            // This ensures consistency across multiple open instances of the site
            this._boundStorageHandler = this.handleStorageChange.bind(this);
            window.addEventListener('storage', this._boundStorageHandler);

            // Dynamically set the current year in the footer if the element exists
            const yearElement = document.getElementById('year');
            if (yearElement) {
                yearElement.textContent = new Date().getFullYear();
            }
        });
    }

    /**
     * Loads settings from localStorage. If no settings are found or if they are invalid,
     * it falls back to the default settings.
     * @returns {object} The loaded or default settings.
     */
    loadSettings() {
        try {
            const storedSettings = localStorage.getItem('websiteSettings');
            if (storedSettings) {
                const parsedSettings = JSON.parse(storedSettings);
                // Validate loaded settings against known valid options and defaults
                const validatedSettings = {
                    appearanceMode: ['device', 'dark', 'light'].includes(parsedSettings.appearanceMode)
                        ? parsedSettings.appearanceMode
                        : this.defaultSettings.appearanceMode,
                    fontSize: this.validateFontSize(parsedSettings.fontSize !== undefined
                        ? parsedSettings.fontSize
                        : this.defaultSettings.fontSize),
                    focusOutline: ['enabled', 'disabled'].includes(parsedSettings.focusOutline)
                        ? parsedSettings.focusOutline
                        : this.defaultSettings.focusOutline,
                };
                console.log("SettingsManager: Loaded settings from localStorage:", validatedSettings);
                return validatedSettings;
            }
        } catch (error) {
            console.error("SettingsManager: Error loading settings from localStorage. Using defaults.", error);
        }
        console.log("SettingsManager: No valid settings in localStorage, using default settings.");
        return { ...this.defaultSettings }; // Return a copy of defaults
    }

    /**
     * Validates the font size.
     * @param {*} size - The font size to validate.
     * @returns {number} The validated font size, or the default if invalid.
     */
    validateFontSize(size) {
        const parsedSize = parseInt(size, 10);
        if (isNaN(parsedSize) || parsedSize < 12 || parsedSize > 24) {
            return this.defaultSettings.fontSize; // Fallback to default if invalid
        }
        return parsedSize;
    }

    /**
     * Initializes the UI controls (dropdowns, sliders, toggles) on the settings page
     * to reflect the currently loaded settings.
     */
    initializeControls() {
        // Appearance Mode Select Dropdown
        const appearanceModeSelect = document.getElementById('appearanceModeSelect');
        if (appearanceModeSelect) {
            appearanceModeSelect.value = this.settings.appearanceMode;
        }

        // Text Size Slider and Value Display
        const textSizeSlider = document.getElementById('text-size-slider');
        const textSizeValueDisplay = document.getElementById('textSizeValue');
        if (textSizeSlider && textSizeValueDisplay) {
            textSizeSlider.value = this.settings.fontSize;
            textSizeValueDisplay.textContent = `${this.settings.fontSize}px`;
            if (typeof this.updateSliderGradient === 'function') {
                this.updateSliderGradient(textSizeSlider); // Update visual fill of the slider
            }
        }

        // Focus Outline Toggle Switch
        const focusOutlineToggle = document.getElementById('focusOutlineToggle');
        if (focusOutlineToggle) {
            focusOutlineToggle.checked = this.settings.focusOutline === 'enabled';
        }
    }

    /**
     * Sets up event listeners for the UI controls on the settings page.
     * These listeners handle user interactions and update settings accordingly.
     */
    setupEventListeners() {
        // Appearance Mode Select Dropdown
        const appearanceModeSelect = document.getElementById('appearanceModeSelect');
        if (appearanceModeSelect) {
            appearanceModeSelect.addEventListener('change', (event) => {
                this.settings.appearanceMode = event.target.value;
                this.applyAppearanceMode(); // Apply the change visually
                this.saveSettings();        // Persist the change
            });
        }

        // Text Size Slider
        const textSizeSlider = document.getElementById('text-size-slider');
        const textSizeValueDisplay = document.getElementById('textSizeValue');
        if (textSizeSlider) {
            textSizeSlider.addEventListener('input', (event) => {
                const newSize = this.validateFontSize(parseInt(event.target.value, 10));
                this.settings.fontSize = newSize;
                if (textSizeValueDisplay) textSizeValueDisplay.textContent = `${newSize}px`;
                this.applyFontSize(); // Apply the change visually
                this.saveSettings();  // Persist the change
                if (typeof this.updateSliderGradient === 'function') {
                    this.updateSliderGradient(textSizeSlider); // Update slider visual fill
                }
            });
        }

        // Focus Outline Toggle Switch
        const focusOutlineToggle = document.getElementById('focusOutlineToggle');
        if (focusOutlineToggle) {
            focusOutlineToggle.addEventListener('change', (event) => {
                this.settings.focusOutline = event.target.checked ? 'enabled' : 'disabled';
                this.applyFocusOutline(); // Apply the change visually
                this.saveSettings();      // Persist the change
            });
        }

        // Reset Settings Button
        const resetButton = document.getElementById('resetSettings');
        if (resetButton) {
            resetButton.addEventListener('click', () => this.resetSettings());
        }
    }

    /**
     * Handles changes in the operating system's theme preference.
     * This is called when the `prefers-color-scheme` media query changes.
     */
    handleDeviceThemeChange() {
        console.log("SettingsManager: Device theme preference changed.");
        // Only re-apply the theme if the website setting is currently 'device' (match device)
        if (this.settings.appearanceMode === 'device') {
            this.applyAppearanceMode();
        }
    }

    /**
     * Handles changes to `localStorage` made by other tabs/windows.
     * This ensures theme consistency across all open instances of the website.
     * @param {StorageEvent} event - The storage event.
     */
    handleStorageChange(event) {
        if (event.key === 'websiteSettings') {
            console.log("SettingsManager: Detected 'websiteSettings' change in localStorage from another tab/window.");
            this.settings = this.loadSettings();   // Reload settings from the updated localStorage
            this.initializeControls();           // Update UI controls on the current page
            this.applyAllSettings();             // Apply the new settings visually
        }
    }

    /**
     * Applies all current settings (theme, font size, focus outline) to the page.
     */
    applyAllSettings() {
        console.log("SettingsManager: Applying all settings:", this.settings);
        this.applyAppearanceMode();
        this.applyFontSize();
        this.applyFocusOutline();
    }

    /**
     * Applies the selected appearance mode (theme) to the document body.
     * It intelligently swaps 'dark-mode' and 'light-mode' classes to prevent a "flash"
     * of unstyled content during theme changes or resets.
     */
    applyAppearanceMode() {
        const body = document.body;
        let isDarkMode;

        // Step 1: Determine if the final theme should be dark or light
        if (this.settings.appearanceMode === 'device') {
            isDarkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            console.log(`SettingsManager: Appearance mode set to 'device'. System prefers dark: ${isDarkMode}.`);
        } else {
            isDarkMode = this.settings.appearanceMode === 'dark';
            console.log(`SettingsManager: Appearance mode explicitly set to '${this.settings.appearanceMode}'.`);
        }

        // Step 2: Define which classes to add and remove based on the final theme
        const classToAdd = isDarkMode ? 'dark-mode' : 'light-mode';
        const classToRemove = isDarkMode ? 'light-mode' : 'dark-mode';

        // Step 3: Atomically perform the class switch. This is the key to preventing the flash.
        // We remove the unwanted class first, then add the correct one.
        // Because this happens in the same execution frame, there is no visible flash.
        if (body.classList.contains(classToRemove)) {
            body.classList.remove(classToRemove);
        }
        // Add the new class if it's not already there.
        if (!body.classList.contains(classToAdd)) {
            body.classList.add(classToAdd);
        }
        
        console.log(`SettingsManager: Body classes set. Final class: '${classToAdd}'.`);
    }

    /**
     * Applies the selected font size by setting a CSS custom property on the root element.
     */
    applyFontSize() {
        const fontSize = this.settings.fontSize;
        document.documentElement.style.setProperty('--font-size-base', `${fontSize}px`);
        console.log(`SettingsManager: Applied font size: ${fontSize}px via CSS variable --font-size-base.`);
        // If you have a more complex JavaScript-based font scaling, it would be called here.
        // For example: if (typeof this.updateTextSizeDOM === 'function') this.updateTextSizeDOM(fontSize);
    }

    /**
     * Applies the focus outline setting by toggling a class on the document body.
     * CSS rules associated with '.focus-outline-disabled' will hide outlines.
     */
    applyFocusOutline() {
        document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled');
        console.log(`SettingsManager: Focus outline set to '${this.settings.focusOutline}'. Body class 'focus-outline-disabled' is ${this.settings.focusOutline === 'disabled'}.`);
    }

    /**
     * Saves the current settings to localStorage.
     */
    saveSettings() {
        try {
            // this.settings.lastUpdated = Date.now(); // Consider if 'lastUpdated' is necessary for your use case
            localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
            console.log("SettingsManager: Settings successfully saved to localStorage:", this.settings);
        } catch (error) {
            console.error("SettingsManager: Error saving settings to localStorage:", error);
        }
    }

    /**
     * Resets all settings to their default values, updates UI, applies, and saves them.
     */
    resetSettings() {
        if (confirm('Are you sure you want to reset all settings to their defaults? This action cannot be undone.')) {
            this.settings = { ...this.defaultSettings }; // Create a fresh copy of defaults
            this.initializeControls();                  // Update UI controls
            this.applyAllSettings();                    // Apply default settings visually
            this.saveSettings();                        // Save defaults to localStorage
            alert('Settings have been reset to their default values.');
            console.log("SettingsManager: All settings have been reset to defaults.");
        }
    }

    /**
     * Updates the visual fill/gradient of a range slider based on its current value.
     * @param {HTMLInputElement} slider - The range slider element.
     */
    updateSliderGradient(slider) {
        // Check if the slider and its necessary properties are valid
        if (!slider || typeof slider.min === 'undefined' || typeof slider.max === 'undefined' || typeof slider.value === 'undefined') {
            return;
        }
        try {
            const min = parseFloat(slider.min);
            const max = parseFloat(slider.max);
            const currentValue = parseFloat(slider.value);

            // Ensure values are numbers and max is greater than min to avoid division by zero
            if (isNaN(min) || isNaN(max) || isNaN(currentValue) || max <= min) {
                return;
            }
            // Calculate the percentage of the slider's progress
            const percentage = ((currentValue - min) * 100) / (max - min);
            // Set a CSS custom property on the slider element itself for styling the track fill
            slider.style.setProperty('--slider-value-percentage', `${percentage}%`);
        } catch (e) {
            console.error("SettingsManager: Error updating slider gradient:", e);
        }
    }
    
    /**
     * Cleans up event listeners when they are no longer needed (e.g., if the SettingsManager instance is destroyed).
     */
    cleanup() {
        if (this.deviceThemeMedia && this._boundDeviceThemeChangeHandler) {
            this.deviceThemeMedia.removeEventListener('change', this._boundDeviceThemeChangeHandler);
            console.log("SettingsManager: Removed device theme change listener.");
        }
        if (this._boundStorageHandler) {
            window.removeEventListener('storage', this._boundStorageHandler);
            console.log("SettingsManager: Removed storage event listener.");
        }
        // Any other listeners added by this instance should be removed here.
        console.log("SettingsManager: Event listeners cleaned up.");
    }
}

// Ensures that only one instance of SettingsManager is created and used globally.
// This instance is attached to the window object for potential access from other scripts if necessary,
// though ideally, other scripts would listen for custom events dispatched by SettingsManager
// or react to changes in localStorage or body classes.
if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
    console.log("SettingsManager: Instance created and attached to window.");
}

// Smoothly animate glass when the theme changes
(function () {
  const DOC = document.documentElement;
  const BODY = document.body;
  const DURATION = 360; // ms

  function runThemeTransition() {
    // Add lightweight transition class to animate colors/glass
    DOC.classList.add('theme-transition');
    BODY.classList.add('is-theming');
    window.setTimeout(() => {
      DOC.classList.remove('theme-transition');
      BODY.classList.remove('is-theming');
    }, DURATION);
  }

  // Animate when system theme flips (auto)
  const mq = window.matchMedia('(prefers-color-scheme: dark)');
  if (mq.addEventListener) {
    mq.addEventListener('change', runThemeTransition);
  } else if (mq.addListener) {
    // Safari <14 fallback
    mq.addListener(runThemeTransition);
  }

  // Hook into your Appearance Mode <select> if present
  const select = document.getElementById('appearanceModeSelect');
  if (select) {
    select.addEventListener('change', () => {
      // Your existing logic likely toggles classes or data attributes.
      // Call the transition wrapper so the glass morphs smoothly.
      runThemeTransition();
    });
  }

  // Optional: expose for manual calls elsewhere
  window.runThemeTransition = runThemeTransition;
})();
