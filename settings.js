/**
 * settings.js
 * Full-featured settings manager for Caleb's website
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

            // System theme change watcher
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this.deviceThemeMedia.addEventListener('change', () => this.applyAppearanceMode());
            }

            // localStorage sync
            window.addEventListener('storage', e => {
                if (e.key === 'websiteSettings') {
                    this.settings = this.loadSettings();
                    this.initializeControls();
                    this.applyAllSettings();
                }
            });
        });
    }

    // ==========================
    // Load & Save
    // ==========================
    loadSettings() {
        try {
            const stored = localStorage.getItem('websiteSettings');
            return stored ? {...this.defaultSettings, ...JSON.parse(stored)} : {...this.defaultSettings};
        } catch {
            return {...this.defaultSettings};
        }
    }

    saveSettings() {
        localStorage.setItem('websiteSettings', JSON.stringify(this.settings));
    }

    // ==========================
    // Initialize Controls
    // ==========================
    initializeControls() {
        // Appearance Mode Segmented Control
        this.setSegmentedControl('appearanceModeControl', this.settings.appearanceMode);

        // Theme Style Segmented Control
        this.setSegmentedControl('themeStyleControl', this.settings.themeStyle);

        // Accent Color
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) accentPicker.value = this.settings.accentColor;

        // Dark Mode Scheduler
        const scheduler = document.getElementById('darkModeScheduler');
        if (scheduler) scheduler.value = this.settings.darkModeScheduler;

        const customInputs = document.getElementById('customTimeInputs');
        if (customInputs) {
            customInputs.style.display = (this.settings.darkModeScheduler === 'custom') ? 'block' : 'none';
            document.getElementById('darkModeStart').value = this.settings.darkModeStart;
            document.getElementById('darkModeEnd').value = this.settings.darkModeEnd;
        }

        // Text Size
        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if (slider && badge) {
            slider.value = this.settings.fontSize;
            badge.textContent = `${this.settings.fontSize}px`;
            this.updateSliderProgress(slider);
        }

        // Toggles
        this.setToggle('focusOutlineToggle', this.settings.focusOutline);
        this.setToggle('hoverAnimationsToggle', this.settings.motionEffects);
        this.setToggle('highContrastToggle', this.settings.highContrast);
        this.setToggle('dyslexiaFontToggle', this.settings.dyslexiaFont);
        this.setToggle('underlineLinksToggle', this.settings.underlineLinks);
        this.setToggle('loadingScreenToggle', this.settings.loadingScreen);
        this.setToggle('mouseTrailToggle', this.settings.mouseTrail);
        this.setToggle('liveStatusToggle', this.settings.liveStatus);
    }

    setSegmentedControl(id, value) {
        const container = document.getElementById(id);
        if (!container) return;
        container.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    setToggle(id, state) {
        const el = document.getElementById(id);
        if (el) el.checked = (state === 'enabled');
        const toggleUI = el?.closest('.toggle-ios');
        if (toggleUI) toggleUI.classList.toggle('active', state === 'enabled');
    }

    updateSliderProgress(slider) {
        const percentage = ((slider.value - slider.min)/(slider.max - slider.min))*100;
        slider.style.setProperty('--slider-value-percentage', `${percentage}%`);
    }

    // ==========================
    // Event Listeners
    // ==========================
    setupEventListeners() {
        // Segmented Controls
        ['appearanceModeControl','themeStyleControl'].forEach(id => {
            const container = document.getElementById(id);
            if (!container) return;
            container.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                const key = id === 'appearanceModeControl' ? 'appearanceMode' : 'themeStyle';
                this.settings[key] = btn.dataset.value;
                this.saveSettings();
                this.applyAllSettings();
                this.setSegmentedControl(id, btn.dataset.value);
            });
        });

        // Accent color
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) {
            accentPicker.addEventListener('input', e => {
                this.settings.accentColor = e.target.value;
                this.applyAccentColor();
                this.saveSettings();
            });
        }

        // Dark Mode Scheduler
        const scheduler = document.getElementById('darkModeScheduler');
        if (scheduler) scheduler.addEventListener('change', e => {
            this.settings.darkModeScheduler = e.target.value;
            document.getElementById('customTimeInputs').style.display = e.target.value === 'custom' ? 'block' : 'none';
            this.applyAppearanceMode();
            this.saveSettings();
        });
        ['darkModeStart','darkModeEnd'].forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('change', e => {
                this.settings[id] = e.target.value;
                this.saveSettings();
            });
        });

        // Text Size
        const slider = document.getElementById('text-size-slider');
        if (slider) {
            slider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value, 10);
                this.updateSliderProgress(slider);
                this.applyFontSize();
                this.saveSettings();
            });
        }

        // Toggles
        [
            ['focusOutlineToggle','focusOutline', this.applyFocusOutline.bind(this)],
            ['hoverAnimationsToggle','motionEffects', this.applyMotionEffects.bind(this)],
            ['highContrastToggle','highContrast', this.applyHighContrast.bind(this)],
            ['dyslexiaFontToggle','dyslexiaFont', this.applyDyslexiaFont.bind(this)],
            ['underlineLinksToggle','underlineLinks', this.applyUnderlineLinks.bind(this)],
            ['loadingScreenToggle','loadingScreen', this.applyLoadingScreen.bind(this)],
            ['mouseTrailToggle','mouseTrail', this.applyMouseTrail.bind(this)],
            ['liveStatusToggle','liveStatus', this.applyLiveStatus.bind(this)]
        ].forEach(([id,key,fn]) => {
            const el = document.getElementById(id);
            if (!el) return;
            el.addEventListener('change', e => {
                this.settings[key] = e.target.checked ? 'enabled':'disabled';
                fn();
                this.saveSettings();
            });
        });

        // Reset Button
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) {
            resetBtn.addEventListener('click', () => this.resetSettings());
        }
    }

    // ==========================
    // Apply Settings
    // ==========================
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
    }

    applyAppearanceMode() {
        const body = document.body;
        let isDark = false;

        if (this.settings.appearanceMode === 'dark') isDark = true;
        else if (this.settings.appearanceMode === 'light') isDark = false;
        else if (this.settings.appearanceMode === 'device') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if (this.settings.darkModeScheduler !== 'off') isDark = this.checkScheduler();

        body.classList.toggle('dark-mode', isDark);
        body.classList.toggle('light-mode', !isDark);
    }

    checkScheduler() {
        const now = new Date();
        const start = this.parseTime(this.settings.darkModeStart);
        const end = this.parseTime(this.settings.darkModeEnd);
        const current = now.getHours()*60 + now.getMinutes();

        if (this.settings.darkModeScheduler === 'sunset') return now.getHours() >= 18 || now.getHours()<6;
        if (this.settings.darkModeScheduler === 'custom') {
            if (start<end) return current>=start && current<end;
            else return current>=start || current<end;
        }
        return false;
    }

    parseTime(str){ const [h,m] = str.split(':').map(Number); return h*60+m; }

    applyThemeStyle() { document.body.classList.toggle('theme-tinted', this.settings.themeStyle==='tinted'); }
    applyAccentColor() { document.documentElement.style.setProperty('--accent-color', this.settings.accentColor); }
    applyFontSize() { document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`); }
    applyFocusOutline() { document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline==='disabled'); }
    applyMotionEffects() { document.body.classList.toggle('motion-disabled', this.settings.motionEffects==='disabled'); }
    applyHighContrast() { document.body.classList.toggle('high-contrast', this.settings.highContrast==='enabled'); }
    applyDyslexiaFont() { document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont==='enabled'); }
    applyUnderlineLinks() { document.body.classList.toggle('underline-links', this.settings.underlineLinks==='enabled'); }
    applyLoadingScreen() {
        const screen = document.getElementById('loading-screen');
        if (!screen) return;
        if (this.settings.loadingScreen==='enabled') screen.classList.remove('loaded');
        else screen.classList.add('loaded');
    }
    applyMouseTrail() {
        const body = document.body;
        body.classList.toggle('mouse-trail-enabled', this.settings.mouseTrail==='enabled');
    }
    applyLiveStatus() { document.body.classList.toggle('live-status-enabled', this.settings.liveStatus==='enabled'); }

    // ==========================
    // Reset
    // ==========================
    resetSettings() {
        if (confirm('Reset all settings to default values?')) {
            this.settings = {...this.defaultSettings};
            this.saveSettings();
            this.initializeControls();
            this.applyAllSettings();
            alert('Settings reset to defaults.');
        }
    }
}

// ==========================
// Initialize
// ==========================
if (!window.settingsManagerInstance) window.settingsManagerInstance = new SettingsManager();

// ==========================
// Footer year
// ==========================
const yearSpan = document.getElementById('year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
