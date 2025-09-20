/**
 * settings.js
 * Manages all user-configurable settings for the website.
 */
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            appearanceMode: 'device',
            accentColor: '#007AFF',
            motionEffects: 'standard', // 'standard', 'subtle', or 'off'
            fontSize: 17,
            focusOutline: 'enabled',
            highContrast: 'disabled',
            dyslexiaFont: 'disabled',
            underlineLinks: 'disabled',
            mouseTrail: 'disabled',
            rearrangingEnabled: 'enabled',
            
            // Homepage Section Visibility
            showSocialLinks: 'enabled',
            showPresidentSection: 'enabled',
            showTiktokShoutouts: 'enabled',
            showInstagramShoutouts: 'enabled',
            showYoutubeShoutouts: 'enabled',
            showUsefulLinks: 'enabled',
            showCountdown: 'enabled',
            showBusinessSection: 'enabled',
            showTechInformation: 'enabled',
            showDisabilitiesSection: 'enabled'
        };

        this.settings = this.loadSettings();
        this.deviceThemeMedia = null;

        document.addEventListener('DOMContentLoaded', () => {
            this.initializeControls();
            this.applyAllSettings();
            this.setupEventListeners();

            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this.deviceThemeMedia.addEventListener('change', () => {
                    if (this.settings.appearanceMode === 'device') this.applyAppearanceMode();
                });
            }
        });
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('websiteSettings');
            const loadedSettings = stored ? JSON.parse(stored) : {};
            return { ...this.defaultSettings, ...loadedSettings };
        } catch {
            return { ...this.defaultSettings };
        }
    }

    saveSettings() {
        localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
    }

    initializeControls() {
        // Appearance
        this.initSegmentedControl('appearanceModeControl', this.settings.appearanceMode);
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) {
            accentPicker.value = this.settings.accentColor;
        }

        // Accessibility
        this.initSegmentedControl('animationControl', this.settings.motionEffects);
        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if (slider && badge) {
            slider.value = this.settings.fontSize;
            badge.textContent = `${this.settings.fontSize}px`;
            this.updateSliderFill(slider); // Correctly update slider on load
        }

        // Toggles
        const toggleKeys = Object.keys(this.defaultSettings).filter(k => this.defaultSettings[k] === 'enabled' || this.defaultSettings[k] === 'disabled');
        toggleKeys.forEach(key => this.setToggle(key));
    }

    initSegmentedControl(controlId, value) {
        const control = document.getElementById(controlId);
        if (!control) return;
        control.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    setToggle(key) {
        const el = document.getElementById(`${key}Toggle`);
        if (el) el.checked = this.settings[key] === 'enabled';
    }

    setupEventListeners() {
        // Appearance Mode
        document.getElementById('appearanceModeControl')?.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (btn) {
                this.settings.appearanceMode = btn.dataset.value;
                this.applySetting('appearanceMode');
                this.saveSettings();
                this.initSegmentedControl('appearanceModeControl', this.settings.appearanceMode);
            }
        });

        // Accent Color
        document.getElementById('accentColorPicker')?.addEventListener('input', e => {
            this.settings.accentColor = e.target.value;
            this.applyAccentColor();
            this.saveSettings();
        });

        // Animation Control
        document.getElementById('animationControl')?.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (btn) {
                this.settings.motionEffects = btn.dataset.value;
                this.applySetting('motionEffects');
                this.saveSettings();
                this.initSegmentedControl('animationControl', this.settings.motionEffects);
            }
        });

        // Text Size Slider
        const slider = document.getElementById('text-size-slider');
        if (slider) {
            slider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value, 10);
                this.applyFontSize();
                document.getElementById('textSizeValue').textContent = `${this.settings.fontSize}px`;
                this.updateSliderFill(e.target); // Correctly update slider on input
                this.saveSettings();
            });
        }

        // All Toggle Switches
        const toggleKeys = Object.keys(this.defaultSettings).filter(k => this.defaultSettings[k] === 'enabled' || this.defaultSettings[k] === 'disabled');
        toggleKeys.forEach(key => {
            const el = document.getElementById(`${key}Toggle`);
            if (el) {
                el.addEventListener('change', () => {
                    this.settings[key] = el.checked ? 'enabled' : 'disabled';
                    this.applySetting(key);
                    this.saveSettings();
                });
            }
        });

        // Reset Buttons
        document.getElementById('resetLayoutBtn')?.addEventListener('click', () => {
            if (confirm('Are you sure you want to reset the section layout to default?')) {
                localStorage.removeItem('sectionOrder');
                alert('Layout has been reset. Please refresh the homepage to see the changes.');
            }
        });
        
        document.getElementById('resetSectionsBtn')?.addEventListener('click', () => this.resetSectionVisibility());
        
        document.getElementById('resetSettings')?.addEventListener('click', () => this.resetSettings());
    }

    updateSliderFill(slider) {
        if (!slider) return;
        const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(to right, var(--accent-color) ${percentage}%, var(--slider-track-color) ${percentage}%)`;
    }
    
    applyAllSettings() {
        Object.keys(this.defaultSettings).forEach(key => this.applySetting(key));
    }

    applySetting(key) {
        const actions = {
            appearanceMode: () => this.applyAppearanceMode(),
            accentColor: () => this.applyAccentColor(),
            motionEffects: () => this.applyMotionEffects(),
            fontSize: () => this.applyFontSize(),
            focusOutline: () => document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled'),
            highContrast: () => document.body.classList.toggle('high-contrast', this.settings.highContrast === 'enabled'),
            dyslexiaFont: () => document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont === 'enabled'),
            underlineLinks: () => document.body.classList.toggle('underline-links', this.settings.underlineLinks === 'enabled'),
            mouseTrail: () => document.body.classList.toggle('mouse-trail-enabled', this.settings.mouseTrail === 'enabled'),
            showSocialLinks: () => this.applySectionVisibility('social-links-section', this.settings.showSocialLinks),
            showPresidentSection: () => this.applySectionVisibility('president-section', this.settings.showPresidentSection),
            showTiktokShoutouts: () => this.applySectionVisibility('tiktok-shoutouts-section', this.settings.showTiktokShoutouts),
            showInstagramShoutouts: () => this.applySectionVisibility('instagram-shoutouts-section', this.settings.showInstagramShoutouts),
            showYoutubeShoutouts: () => this.applySectionVisibility('youtube-shoutouts-section', this.settings.showYoutubeShoutouts),
            showUsefulLinks: () => this.applySectionVisibility('useful-links-section', this.settings.showUsefulLinks),
            showCountdown: () => this.applySectionVisibility('countdown-section', this.settings.showCountdown),
            showBusinessSection: () => this.applySectionVisibility('business-section', this.settings.showBusinessSection),
            showTechInformation: () => this.applySectionVisibility('tech-information-section', this.settings.showTechInformation),
            showDisabilitiesSection: () => this.applySectionVisibility('disabilities-section', this.settings.showDisabilitiesSection),
        };
        actions[key]?.();
    }

    applyAppearanceMode() {
        let isDark = this.settings.appearanceMode === 'dark' || (this.settings.appearanceMode === 'device' && window.matchMedia('(prefers-color-scheme: dark)').matches);
        document.body.classList.toggle('dark-mode', isDark);
        document.body.classList.toggle('light-mode', !isDark);
        this.checkAccentColor(this.settings.accentColor);
    }

    applyAccentColor() {
        const accentColor = this.settings.accentColor;
        document.documentElement.style.setProperty('--accent-color', accentColor);
        document.documentElement.style.setProperty('--accent-text-color', this.getContrastColor(accentColor));
        this.checkAccentColor(accentColor);
    }

    applyMotionEffects() {
        document.body.classList.remove('reduce-motion', 'subtle-motion');
        if (this.settings.motionEffects === 'subtle') {
            document.body.classList.add('subtle-motion');
        } else if (this.settings.motionEffects === 'off') {
            document.body.classList.add('reduce-motion');
        }
    }

    applyFontSize() {
        document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`);
    }

    applySectionVisibility(sectionId, status) {
        const section = document.getElementById(sectionId);
        if (section) {
            section.style.display = status === 'enabled' ? '' : 'none';
        }
    }

    checkAccentColor(hexcolor) {
        const warningElement = document.getElementById('whiteAccentWarning');
        if (!warningElement) return;
        let isLightMode = this.settings.appearanceMode === 'light' || (this.settings.appearanceMode === 'device' && !window.matchMedia('(prefers-color-scheme: dark)').matches);
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        const isLightColor = r > 240 && g > 240 && b > 240;
        warningElement.style.display = isLightColor && isLightMode ? 'block' : 'none';
    }

    getContrastColor(hexcolor) {
        if (!hexcolor) return '#ffffff';
        const r = parseInt(hexcolor.substr(1, 2), 16);
        const g = parseInt(hexcolor.substr(3, 2), 16);
        const b = parseInt(hexcolor.substr(5, 2), 16);
        const yiq = ((r * 299) + (g * 587) + (b * 114)) / 1000;
        return (yiq >= 128) ? '#000000' : '#ffffff';
    }

    resetSectionVisibility() {
        if (confirm('Are you sure you want to make all homepage sections visible again?')) {
            const sectionKeys = Object.keys(this.defaultSettings).filter(k => k.startsWith('show'));
            sectionKeys.forEach(key => {
                this.settings[key] = 'enabled';
            });
            this.saveSettings();
            this.initializeControls();
            this.applyAllSettings();
            alert('All homepage sections have been made visible.');
        }
    }

    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            localStorage.removeItem('sectionOrder');
            this.initializeControls();
            this.applyAllSettings();
            alert('All settings and the layout have been reset to default.');
        }
    }
}

if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
}
