/**
 * settings.js
 * Manages all website settings including appearance, theme style,
 * accent color, accessibility features, and visual flair.
 */
class SettingsManager {
    constructor() {
        // Default settings
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

            loadingScreen: 'disabled',
            mouseTrail: 'disabled',
            liveStatus: 'disabled'
        };

        this.settings = this.loadSettings();
        this.deviceThemeMedia = null;

        document.addEventListener('DOMContentLoaded', () => {
            this.initializeControls();
            this.applyAllSettings();
            this.setupEventListeners();
            this.initFooterYear();
            this.initLoadingScreen();
            this.initMouseTrail();

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
                return { ...this.defaultSettings, ...JSON.parse(storedSettings) };
            }
        } catch (err) {
            console.error("SettingsManager: error loading settings", err);
        }
        return { ...this.defaultSettings };
    }

    saveSettings() {
        try {
            localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
        } catch (err) {
            console.error("SettingsManager: error saving settings", err);
        }
    }

    initializeControls() {
        const appearanceModeControl = document.getElementById('appearanceModeControl');
        if (appearanceModeControl) {
            appearanceModeControl.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === this.settings.appearanceMode);
            });
        }

        const themeStyleControl = document.getElementById('themeStyleControl');
        if (themeStyleControl) {
            themeStyleControl.querySelectorAll('button').forEach(btn => {
                btn.classList.toggle('active', btn.dataset.value === this.settings.themeStyle);
            });
        }

        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) accentPicker.value = this.settings.accentColor;

        const schedulerSelect = document.getElementById('darkModeScheduler');
        if (schedulerSelect) schedulerSelect.value = this.settings.darkModeScheduler;
        const customInputs = document.getElementById('customTimeInputs');
        if (customInputs) {
            customInputs.style.display = (this.settings.darkModeScheduler === 'custom') ? 'block' : 'none';
            document.getElementById('darkModeStart').value = this.settings.darkModeStart;
            document.getElementById('darkModeEnd').value = this.settings.darkModeEnd;
        }

        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if (slider && badge) {
            slider.value = this.settings.fontSize;
            badge.textContent = `${this.settings.fontSize}px`;
            this.updateSliderProgress();
        }

        this.setToggle('focusOutlineToggle', this.settings.focusOutline);
        this.setToggle('hoverAnimationsToggle', this.settings.motionEffects);
        this.setToggle('highContrastToggle', this.settings.highContrast);
        this.setToggle('dyslexiaFontToggle', this.settings.dyslexiaFont);
        this.setToggle('underlineLinksToggle', this.settings.underlineLinks);
        this.setToggle('loadingScreenToggle', this.settings.loadingScreen);
        this.setToggle('mouseTrailToggle', this.settings.mouseTrail);
        this.setToggle('liveStatusToggle', this.settings.liveStatus);
    }

    setToggle(id, state) {
        const el = document.getElementById(id);
        if (el) el.checked = (state === 'enabled');
    }

    setupEventListeners() {
        const appearanceModeControl = document.getElementById('appearanceModeControl');
        if (appearanceModeControl) {
            appearanceModeControl.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) {
                    this.settings.appearanceMode = btn.dataset.value;
                    this.applyAppearanceMode();
                    this.saveSettings();
                    this.initializeControls();
                }
            });
        }

        const themeStyleControl = document.getElementById('themeStyleControl');
        if (themeStyleControl) {
            themeStyleControl.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (btn) {
                    this.settings.themeStyle = btn.dataset.value;
                    this.applyThemeStyle();
                    this.saveSettings();
                    this.initializeControls();
                }
            });
        }

        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) {
            accentPicker.addEventListener('input', e => {
                this.settings.accentColor = e.target.value;
                this.applyAccentColor();
                this.saveSettings();
            });
        }

        const schedulerSelect = document.getElementById('darkModeScheduler');
        if (schedulerSelect) {
            schedulerSelect.addEventListener('change', e => {
                this.settings.darkModeScheduler = e.target.value;
                this.applyAppearanceMode();
                this.saveSettings();
                this.initializeControls();
            });
        }

        const darkStart = document.getElementById('darkModeStart');
        const darkEnd = document.getElementById('darkModeEnd');
        if (darkStart && darkEnd) {
            darkStart.addEventListener('change', e => { this.settings.darkModeStart = e.target.value; this.saveSettings(); });
            darkEnd.addEventListener('change', e => { this.settings.darkModeEnd = e.target.value; this.saveSettings(); });
        }

        const slider = document.getElementById('text-size-slider');
        if (slider) {
            slider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value, 10);
                this.applyFontSize();
                this.updateSliderProgress();
                this.saveSettings();
                this.initializeControls();
            });
        }

        this.bindToggle('focusOutlineToggle', 'focusOutline', this.applyFocusOutline.bind(this));
        this.bindToggle('hoverAnimationsToggle', 'motionEffects', this.applyMotionEffects.bind(this));
        this.bindToggle('highContrastToggle', 'highContrast', this.applyHighContrast.bind(this));
        this.bindToggle('dyslexiaFontToggle', 'dyslexiaFont', this.applyDyslexiaFont.bind(this));
        this.bindToggle('underlineLinksToggle', 'underlineLinks', this.applyUnderlineLinks.bind(this));
        this.bindToggle('loadingScreenToggle', 'loadingScreen', this.applyLoadingScreen.bind(this));
        this.bindToggle('mouseTrailToggle', 'mouseTrail', this.applyMouseTrail.bind(this));
        this.bindToggle('liveStatusToggle', 'liveStatus', this.applyLiveStatus.bind(this));

        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
    }

    bindToggle(id, key, applyFn) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('change', e => {
                this.settings[key] = e.target.checked ? 'enabled' : 'disabled';
                applyFn();
                this.saveSettings();
            });
        }
    }

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
        this.applyLoadingScreen();
        this.applyMouseTrail();
        this.applyLiveStatus();
        this.updateSliderProgress();
    }

    applyAppearanceMode() {
        const body = document.body;
        let isDark = false;

        if (this.settings.appearanceMode === 'dark') isDark = true;
        else if (this.settings.appearanceMode === 'light') isDark = false;
        else if (this.settings.appearanceMode === 'device') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (this.settings.darkModeScheduler !== 'off' && this.settings.appearanceMode === 'device') {
            isDark = this.checkScheduler();
        }

        body.classList.toggle('dark-mode', isDark);
        body.classList.toggle('light-mode', !isDark);
    }

    checkScheduler() {
        const now = new Date();
        const start = this.parseTime(this.settings.darkModeStart);
        const end = this.parseTime(this.settings.darkModeEnd);
        const current = now.getHours() * 60 + now.getMinutes();

        if (this.settings.darkModeScheduler === 'sunset') return (now.getHours() >= 18 || now.getHours() < 6);
        if (this.settings.darkModeScheduler === 'custom') {
            if (start < end) return current >= start && current < end;
            return current >= start || current < end;
        }
        return false;
    }

    parseTime(str) { const [h, m] = str.split(':').map(Number); return h * 60 + m; }

    applyThemeStyle() { document.body.classList.toggle('theme-tinted', this.settings.themeStyle === 'tinted'); }
    applyAccentColor() { document.documentElement.style.setProperty('--accent-color', this.settings.accentColor); }
    applyFontSize() { document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`); }
    applyFocusOutline() { document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled'); }
    applyMotionEffects() { document.body.classList.toggle('motion-disabled', this.settings.motionEffects === 'disabled'); }
    applyHighContrast() { document.body.classList.toggle('high-contrast', this.settings.highContrast === 'enabled'); }
    applyDyslexiaFont() { document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont === 'enabled'); }
    applyUnderlineLinks() { document.body.classList.toggle('underline-links', this.settings.underlineLinks === 'enabled'); }

    applyLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (!loadingScreen) return;
        loadingScreen.style.display = (this.settings.loadingScreen === 'enabled') ? 'flex' : 'none';
        if (this.settings.loadingScreen === 'enabled') {
            setTimeout(() => loadingScreen.classList.add('loaded'), 500);
        } else {
            loadingScreen.classList.remove('loaded');
        }
    }

    applyMouseTrail() {
        const body = document.body;
        if (this.settings.mouseTrail === 'enabled') {
            body.classList.add('mouse-trail-enabled');
        } else {
            body.classList.remove('mouse-trail-enabled');
        }
    }

    applyLiveStatus() { document.body.classList.toggle('live-status-enabled', this.settings.liveStatus === 'enabled'); }

    handleDeviceThemeChange() { if (this.settings.appearanceMode === 'device') this.applyAppearanceMode(); }
    handleStorageChange(e) { if (e.key === 'websiteSettings') { this.settings = this.loadSettings(); this.initializeControls(); this.applyAllSettings(); } }

    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.initializeControls();
            this.applyAllSettings();
            alert('Settings reset to defaults.');
        }
    }

    updateSliderProgress() {
        const slider = document.getElementById('text-size-slider');
        if (!slider) return;
        const min = slider.min ? parseInt(slider.min) : 12;
        const max = slider.max ? parseInt(slider.max) : 24;
        const val = parseInt(slider.value);
        const percent = ((val - min) / (max - min)) * 100;
        document.documentElement.style.setProperty('--slider-value-percentage', `${percent}%`);
    }

    initFooterYear() {
        const yearSpan = document.getElementById('year');
        if (yearSpan) yearSpan.textContent = new Date().getFullYear();
    }

    initLoadingScreen() {
        if (this.settings.loadingScreen === 'enabled') {
            const loadingScreen = document.getElementById('loading-screen');
            if (loadingScreen) {
                setTimeout(() => loadingScreen.classList.add('loaded'), 800);
            }
        }
    }

    initMouseTrail() {
        if (this.settings.mouseTrail !== 'enabled') return;
        const body = document.body;
        const trailContainer = document.createElement('div');
        trailContainer.id = 'mouse-trail';
        body.appendChild(trailContainer);

        body.addEventListener('mousemove', e => {
            const trail = document.createElement('div');
            trail.className = 'trail';
            trail.style.left = `${e.clientX}px`;
            trail.style.top = `${e.clientY}px`;
            trailContainer.appendChild(trail);
            setTimeout(() => trail.remove(), 800);
        });
    }
}

// Init
if (!window.settingsManagerInstance) {
    window.settingsManagerInstance = new SettingsManager();
}
