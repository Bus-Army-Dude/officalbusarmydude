/**
 * settings.js
 * Global settings manager: works on settings page and other pages
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
            fontSize: 16,
            focusOutline: 'disabled',
            motionEffects: 'enabled',
            highContrast: 'disabled',
            dyslexiaFont: 'disabled',
            underlineLinks: 'disabled',
            loadingScreen: 'disabled',
            mouseTrail: 'disabled',
            liveStatus: 'disabled'
        };

        this.settings = this.loadSettings();

        // Apply immediately to all pages
        this.applyGlobalSettings();

        // Settings page initialization
        document.addEventListener('DOMContentLoaded', () => {
            if(document.body.classList.contains('settings-page')){
                this.initializeControls();
                this.applyAllSettings();
                this.setupEventListeners();
                this.initMouseTrail();
                this.initLoadingScreen();
            }

            // Set current year in footer
            const yearSpan = document.getElementById('year');
            if(yearSpan) yearSpan.textContent = new Date().getFullYear();
        });

        // Watch for localStorage changes (multi-tab sync)
        window.addEventListener('storage', (e) => {
            if(e.key === 'websiteSettings'){
                this.settings = this.loadSettings();
                this.applyGlobalSettings();
                if(document.body.classList.contains('settings-page')){
                    this.applyAllSettings();
                    this.initializeControls();
                }
            }
        });
    }

    // Load settings from localStorage
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

    // =========================
    // Apply settings globally
    // =========================
    applyGlobalSettings() {
        // Accent color
        document.documentElement.style.setProperty('--accent-color', this.settings.accentColor);

        // Font size
        document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`);

        // Appearance / dark mode
        this.applyAppearanceMode();

        // High contrast
        document.body.classList.toggle('high-contrast', this.settings.highContrast === 'enabled');

        // Motion effects
        document.body.classList.toggle('motion-disabled', this.settings.motionEffects === 'disabled');

        // Focus outline
        document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline === 'disabled');

        // Dyslexia-friendly font
        document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont === 'enabled');

        // Underline links
        document.body.classList.toggle('underline-links', this.settings.underlineLinks === 'enabled');

        // Mouse trail
        if(this.settings.mouseTrail === 'enabled') this.initMouseTrail();
    }

    // =========================
    // Settings Page Only
    // =========================
    initializeControls() {
        // Segmented controls
        this.initSegmentedControl('appearanceModeControl', this.settings.appearanceMode);
        this.initSegmentedControl('themeStyleControl', this.settings.themeStyle);

        // Accent picker
        const accentPicker = document.getElementById('accentColorPicker');
        if(accentPicker) accentPicker.value = this.settings.accentColor;

        // Dark Mode Scheduler
        const schedulerSelect = document.getElementById('darkModeScheduler');
        if(schedulerSelect) schedulerSelect.value = this.settings.darkModeScheduler;

        const customInputs = document.getElementById('customTimeInputs');
        if(customInputs){
            customInputs.style.display = this.settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
            document.getElementById('darkModeStart').value = this.settings.darkModeStart;
            document.getElementById('darkModeEnd').value = this.settings.darkModeEnd;
        }

        // Text size slider
        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if(slider && badge){
            slider.value = this.settings.fontSize;
            badge.textContent = `${this.settings.fontSize}px`;
            this.updateSliderFill(slider);
        }

        // Toggles
        ['focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'].forEach(key => this.setToggle(key));
    }

    initSegmentedControl(controlId, value){
        const control = document.getElementById(controlId);
        if(!control) return;
        control.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    setToggle(key){
        const el = document.getElementById(`${key}Toggle`);
        if(el) el.checked = this.settings[key] === 'enabled';
    }

    setupEventListeners(){
        // Segmented controls
        ['appearanceMode','themeStyle'].forEach(key => {
            const control = document.getElementById(`${key}Control`);
            if(!control) return;
            control.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if(!btn) return;
                this.settings[key] = btn.dataset.value;
                this.applySetting(key);
                this.saveSettings();
                this.initSegmentedControl(`${key}Control`, this.settings[key]);
            });
        });

        // Accent picker
        const accentPicker = document.getElementById('accentColorPicker');
        if(accentPicker){
            accentPicker.addEventListener('input', e => {
                this.settings.accentColor = e.target.value;
                this.applyAccentColor();
                this.saveSettings();
            });
        }

        // Dark Mode Scheduler
        const schedulerSelect = document.getElementById('darkModeScheduler');
        if(schedulerSelect){
            schedulerSelect.addEventListener('change', e => {
                this.settings.darkModeScheduler = e.target.value;
                this.applyAppearanceMode();
                this.saveSettings();
                document.getElementById('customTimeInputs').style.display = this.settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
            });
        }

        ['darkModeStart','darkModeEnd'].forEach(id => {
            const input = document.getElementById(id);
            if(input) input.addEventListener('change', e => {
                this.settings[id] = e.target.value;
                this.saveSettings();
                this.applyAppearanceMode();
            });
        });

        // Text Size Slider
        const slider = document.getElementById('text-size-slider');
        if(slider){
            slider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value,10);
                this.applyFontSize();
                this.updateSliderFill(slider);
                this.saveSettings();
            });
        }

        // Toggles
        ['focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'].forEach(key => {
            const el = document.getElementById(`${key}Toggle`);
            if(!el) return;
            el.addEventListener('change', () => {
                this.settings[key] = el.checked ? 'enabled' : 'disabled';
                this.applySetting(key);
                this.saveSettings();
            });
        });

        // Reset button
        const resetBtn = document.getElementById('resetSettings');
        if(resetBtn) resetBtn.addEventListener('click', () => this.resetSettings());
    }

    updateSliderFill(slider){
        const pct = ((slider.value - slider.min)/(slider.max - slider.min))*100;
        slider.style.background = `linear-gradient(90deg, var(--accent-color) 0%, var(--accent-color) ${pct}%, var(--slider-track-color) ${pct}%, var(--slider-track-color) 100%)`;
    }

    applyAllSettings(){
        ['appearanceMode','themeStyle','accentColor','fontSize','focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'].forEach(key => this.applySetting(key));
    }

    applySetting(key){
        switch(key){
            case 'appearanceMode': this.applyAppearanceMode(); break;
            case 'themeStyle': this.applyThemeStyle(); break;
            case 'accentColor': this.applyAccentColor(); break;
            case 'fontSize': this.applyFontSize(); break;
            case 'focusOutline': this.applyFocusOutline(); break;
            case 'motionEffects': this.applyMotionEffects(); break;
            case 'highContrast': this.applyHighContrast(); break;
            case 'dyslexiaFont': this.applyDyslexiaFont(); break;
            case 'underlineLinks': this.applyUnderlineLinks(); break;
            case 'loadingScreen': this.applyLoadingScreen(); break;
            case 'mouseTrail': this.initMouseTrail(); break;
            case 'liveStatus': this.applyLiveStatus(); break;
        }
    }

    // =========================
    // Appearance / Theme
    // =========================
    applyAppearanceMode(){
        let isDark = false;
        const body = document.body;
        if(this.settings.appearanceMode === 'dark') isDark = true;
        else if(this.settings.appearanceMode === 'light') isDark = false;
        else if(this.settings.appearanceMode === 'device') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if(this.settings.darkModeScheduler !== 'off' && this.settings.appearanceMode !== 'dark' && this.settings.appearanceMode !== 'light'){
            isDark = this.checkScheduler();
        }

        body.classList.toggle('dark-mode', isDark);
        body.classList.toggle('light-mode', !isDark);
    }

    checkScheduler(){
        const now = new Date();
        const start = this.parseTime(this.settings.darkModeStart);
        const end = this.parseTime(this.settings.darkModeEnd);
        const current = now.getHours()*60 + now.getMinutes();
        if(this.settings.darkModeScheduler === 'sunset') return now.getHours() >= 18 || now.getHours() < 6;
        if(this.settings.darkModeScheduler === 'custom') return start < end ? current >= start && current < end : current >= start || current < end;
        return false;
    }

    parseTime(str){ const [h,m] = str.split(':').map(Number); return h*60+m; }

    applyThemeStyle(){ document.body.classList.toggle('theme-tinted', this.settings.themeStyle==='tinted'); }
    applyAccentColor(){ document.documentElement.style.setProperty('--accent-color', this.settings.accentColor); }
    applyFontSize(){ document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`); }
    applyFocusOutline(){ document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline==='disabled'); }
    applyMotionEffects(){ document.body.classList.toggle('motion-disabled', this.settings.motionEffects==='disabled'); }
    applyHighContrast(){ document.body.classList.toggle('high-contrast', this.settings.highContrast==='enabled'); }
    applyDyslexiaFont(){ document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont==='enabled'); }
    applyUnderlineLinks(){ document.body.classList.toggle('underline-links', this.settings.underlineLinks==='enabled'); }
    applyLoadingScreen(){ /* Implement loading screen logic if needed */ }
    applyLiveStatus(){ /* Implement live status logic if needed */ }

    // =========================
    // Mouse Trail Effect
    // =========================
    initMouseTrail(){
        // Remove previous trail
        const existing = document.querySelectorAll('.mouse-trail-dot');
        existing.forEach(dot => dot.remove());

        if(this.settings.mouseTrail!=='enabled') return;

        let trailDots = [];
        document.addEventListener('mousemove', e => {
            const dot = document.createElement('div');
            dot.className = 'mouse-trail-dot';
            dot.style.left = `${e.pageX}px`;
            dot.style.top = `${e.pageY}px`;
            document.body.appendChild(dot);
            trailDots.push(dot);
            setTimeout(() => { dot.remove(); trailDots.shift(); }, 500);
        });
    }

    // =========================
    // Reset Settings
    // =========================
    resetSettings(){
        if(!confirm('Are you sure you want to reset all settings to default?')) return;
        this.settings = { ...this.defaultSettings };
        this.saveSettings();
        this.applyGlobalSettings();
        if(document.body.classList.contains('settings-page')){
            this.applyAllSettings();
            this.initializeControls();
        }
    }
}

// Initialize settings manager
window.settingsManager = new SettingsManager();

