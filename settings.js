/**
 * settings.js
 * Fully functional settings manager for live updates
 */
class SettingsManager {
    constructor() {
        this.defaultSettings = {
            appearanceMode: 'device',   // device | light | dark
            themeStyle: 'clear',        // clear | tinted
            accentColor: '#3ddc84',
            darkModeScheduler: 'off',   // off | sunset | custom
            darkModeStart: '20:00',
            darkModeEnd: '06:00',

            fontSize: 16,               // 12–24 px
            focusOutline: 'disabled',   // enabled | disabled
            motionEffects: 'enabled',   // enabled | disabled
            highContrast: 'disabled',
            dyslexiaFont: 'disabled',
            underlineLinks: 'disabled',

            mouseTrail: 'disabled'
        };

        this.settings = this.loadSettings();

        document.addEventListener('DOMContentLoaded', () => {
            this.cacheElements();
            this.applyAllSettings();
            this.setupEventListeners();
            this.initMouseTrail();

            // Watch for system theme changes
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this.deviceThemeMedia.addEventListener('change', () => {
                    if (this.settings.appearanceMode === 'device') this.applyAppearanceMode();
                });
            }

            // Footer year
            const yearSpan = document.getElementById('year');
            if (yearSpan) yearSpan.textContent = new Date().getFullYear();
        });
    }

    cacheElements() {
        this.appearanceModeControl = document.getElementById('appearanceModeControl');
        this.themeStyleControl = document.getElementById('themeStyleControl');
        this.accentColorPicker = document.getElementById('accentColorPicker');
        this.textSizeSlider = document.getElementById('text-size-slider');
        this.textSizeValue = document.getElementById('textSizeValue');
        this.resetButton = document.getElementById('resetSettings');

        // Toggles
        this.focusOutlineToggle = document.getElementById('focusOutlineToggle');
        this.motionEffectsToggle = document.getElementById('hoverAnimationsToggle');
        this.highContrastToggle = document.getElementById('highContrastToggle');
        this.dyslexiaFontToggle = document.getElementById('dyslexiaFontToggle');
        this.underlineLinksToggle = document.getElementById('underlineLinksToggle');
        this.mouseTrailToggle = document.getElementById('mouseTrailToggle');

        // Dark Mode Scheduler
        this.darkModeSchedulerControl = document.getElementById('darkModeScheduler');
        this.darkModeStart = document.getElementById('darkModeStart');
        this.darkModeEnd = document.getElementById('darkModeEnd');
        this.customTimeInputs = document.getElementById('customTimeInputs');
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('websiteSettings');
            return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : { ...this.defaultSettings };
        } catch {
            return { ...this.defaultSettings };
        }
    }

    saveSettings() {
        localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
    }

    // ========================
    // Apply Settings
    // ========================
    applyAllSettings() {
        this.applyAppearanceMode();
        this.applyThemeStyle();
        this.applyAccentColor();
        this.applyFontSize();
        this.applyFocusOutline();
        this.applyMotionEffects();
        this.applyHighContrast();
        this.applyDyslexiaFont();
        this.applyUnderlineLinks();
        this.applyMouseTrail();
    }

    applyAppearanceMode() {
        const body = document.body;
        let isDark = false;

        if (this.settings.appearanceMode === 'dark') isDark = true;
        else if (this.settings.appearanceMode === 'light') isDark = false;
        else if (this.settings.appearanceMode === 'device') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (this.settings.darkModeScheduler !== 'off') {
            const now = new Date();
            const start = this.parseTime(this.settings.darkModeStart);
            const end = this.parseTime(this.settings.darkModeEnd);
            const current = now.getHours() * 60 + now.getMinutes();

            if (this.settings.darkModeScheduler === 'sunset') {
                isDark = now.getHours() >= 18 || now.getHours() < 6;
            } else if (this.settings.darkModeScheduler === 'custom') {
                isDark = start < end ? current >= start && current < end : current >= start || current < end;
            }
        }

        body.classList.toggle('dark-mode', isDark);
        body.classList.toggle('light-mode', !isDark);
    }

    parseTime(str) { 
        const [h, m] = str.split(':').map(Number); 
        return h * 60 + m; 
    }

    applyThemeStyle() {
        document.body.classList.toggle('theme-tinted', this.settings.themeStyle === 'tinted');
    }

    applyAccentColor() {
        document.documentElement.style.setProperty('--accent-color', this.settings.accentColor);
    }

    applyFontSize() {
        document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`);
        if (this.textSizeValue) this.textSizeValue.textContent = `${this.settings.fontSize}px`;
    }

    applyFocusOutline() {
        document.body.classList.toggle('focus-outline', this.settings.focusOutline === 'enabled');
    }

    applyMotionEffects() {
        document.body.classList.toggle('reduce-motion', this.settings.motionEffects === 'disabled');
    }

    applyHighContrast() {
        document.body.classList.toggle('high-contrast', this.settings.highContrast === 'enabled');
    }

    applyDyslexiaFont() {
        document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont === 'enabled');
    }

    applyUnderlineLinks() {
        document.body.classList.toggle('underline-links', this.settings.underlineLinks === 'enabled');
    }

    applyMouseTrail() {
        document.body.classList.toggle('mouse-trail-enabled', this.settings.mouseTrail === 'enabled');
    }

    // ========================
    // Initialize / Event Listeners
    // ========================
    setupEventListeners() {
        // Segmented Controls
        const segmentedKeys = ['appearanceMode', 'themeStyle'];
        segmentedKeys.forEach(key => {
            const control = document.getElementById(`${key}Control`);
            if (!control) return;
            control.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                this.settings[key] = btn.dataset.value;
                this.applyAllSettings();
                this.saveSettings();
                btn.parentElement.querySelectorAll('button').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Accent color
        if (this.accentColorPicker) {
            this.accentColorPicker.addEventListener('input', e => {
                this.settings.accentColor = e.target.value;
                this.applyAccentColor();
                this.saveSettings();
            });
        }

        // Text size
        if (this.textSizeSlider) {
            this.textSizeSlider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value, 10);
                this.applyFontSize();
                this.updateSliderFill(this.textSizeSlider);
                this.saveSettings();
            });
            this.updateSliderFill(this.textSizeSlider);
        }

        // Toggles
        const toggles = [
            ['focusOutline', this.focusOutlineToggle],
            ['motionEffects', this.motionEffectsToggle],
            ['highContrast', this.highContrastToggle],
            ['dyslexiaFont', this.dyslexiaFontToggle],
            ['underlineLinks', this.underlineLinksToggle],
            ['mouseTrail', this.mouseTrailToggle]
        ];

        toggles.forEach(([key, el]) => {
            if (!el) return;
            el.checked = this.settings[key] === 'enabled';
            el.addEventListener('change', () => {
                this.settings[key] = el.checked ? 'enabled' : 'disabled';
                this.applySetting(key);
                this.saveSettings();
            });
        });

        // Reset
        if (this.resetButton) {
            this.resetButton.addEventListener('click', () => this.resetSettings());
        }
    }

    applySetting(key) {
        switch(key) {
            case 'appearanceMode': this.applyAppearanceMode(); break;
            case 'themeStyle': this.applyThemeStyle(); break;
            case 'accentColor': this.applyAccentColor(); break;
            case 'fontSize': this.applyFontSize(); break;
            case 'focusOutline': this.applyFocusOutline(); break;
            case 'motionEffects': this.applyMotionEffects(); break;
            case 'highContrast': this.applyHighContrast(); break;
            case 'dyslexiaFont': this.applyDyslexiaFont(); break;
            case 'underlineLinks': this.applyUnderlineLinks(); break;
            case 'mouseTrail': this.applyMouseTrail(); break;
        }
    }

    updateSliderFill(slider) {
        const pct = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
        slider.style.background = `linear-gradient(90deg, var(--accent-color) 0%, var(--accent-color) ${pct}%, var(--slider-track-color) ${pct}%, var(--slider-track-color) 100%)`;
    }

    // ========================
    // Mouse Trail
    // ========================
    initMouseTrail() {
        const trailContainer = document.getElementById('mouse-trail') || (() => {
            const div = document.createElement('div');
            div.id = 'mouse-trail';
            document.body.appendChild(div);
            return div;
        })();

        document.addEventListener('mousemove', e => {
            if (this.settings.mouseTrail !== 'enabled') return;
            const dot = document.createElement('div');
            dot.className = 'trail';
            dot.style.left = `${e.clientX}px`;
            dot.style.top = `${e.clientY}px`;
            trailContainer.appendChild(dot);
            setTimeout(() => dot.remove(), 800);
        });
    }

    // ========================
    // Reset Settings
    // ========================
    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.applyAllSettings();
            this.setupEventListeners();
            alert('Settings reset to defaults.');
        }
    }
}

// Initialize
if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
}
