/**
 * settings.js
 * Fully functional settings manager with live previews and real-time scheduler
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
            focusOutline: 'enabled',    // enabled | disabled
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
        this.schedulerInterval = null;

        document.addEventListener('DOMContentLoaded', () => {
            this.initializeControls();
            this.applyAllSettings();
            this.setupEventListeners();
            this.initMouseTrail();
            this.initLoadingScreen();
            this.initSchedulerInterval();

            // Watch for system theme changes
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this.deviceThemeMedia.addEventListener('change', () => {
                    if (this.settings.appearanceMode === 'device') this.applyAppearanceMode();
                });
            }

            // Watch for system reduced motion preference
            if (window.matchMedia) {
                const motionMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
                motionMedia.addEventListener('change', (e) => {
                    if (!localStorage.getItem('websiteSettings')) {
                        this.settings.motionEffects = e.matches ? 'disabled' : 'enabled';
                        this.applyMotionEffects();
                        this.saveSettings();
                        this.setToggle('motionEffects');
                    }
                });
            }

            // Watch for localStorage changes
            window.addEventListener('storage', (e) => {
                if (e.key === 'websiteSettings') {
                    this.settings = this.loadSettings();
                    this.applyAllSettings();
                    this.initializeControls();
                }
            });

            // Set year in footer
            const yearSpan = document.getElementById('year');
            if (yearSpan) yearSpan.textContent = new Date().getFullYear();
        });
    }

    // Load/Save
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
    // Initialize Controls
    // ========================
    initializeControls() {
        this.initSegmentedControl('appearanceModeControl', this.settings.appearanceMode);
        this.initSegmentedControl('themeStyleControl', this.settings.themeStyle);

        // Accent color picker
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) accentPicker.value = this.settings.accentColor;

        // Dark Mode Scheduler
        const schedulerSelect = document.getElementById('darkModeScheduler');
        if (schedulerSelect) schedulerSelect.value = this.settings.darkModeScheduler;

        const customInputs = document.getElementById('customTimeInputs');
        if (customInputs) {
            customInputs.style.display = this.settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
            this.updateSchedulerPreview('darkModeStartInput', 'darkModeStart');
            this.updateSchedulerPreview('darkModeEndInput', 'darkModeEnd');
        }

        // Text size slider
        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if (slider && badge) {
            slider.value = this.settings.fontSize;
            badge.textContent = `${this.settings.fontSize}px`;
            this.updateSliderFill(slider);
        }

        // Toggles
        const toggles = [
            'focusOutline', 'motionEffects', 'highContrast',
            'dyslexiaFont', 'underlineLinks', 'loadingScreen',
            'mouseTrail', 'liveStatus'
        ];
        toggles.forEach(key => this.setToggle(key));
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

    // ========================
    // Event Listeners
    // ========================
    setupEventListeners() {
        ['appearanceMode', 'themeStyle'].forEach(key => {
            const control = document.getElementById(`${key}Control`);
            if (!control) return;
            control.addEventListener('click', e => {
                const btn = e.target.closest('button');
                if (!btn) return;
                this.settings[key] = btn.dataset.value;
                this.applySetting(key);
                this.saveSettings();
                this.initSegmentedControl(`${key}Control`, this.settings[key]);
            });
        });

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
                document.getElementById('customTimeInputs').style.display = this.settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
            });
        }

        // Custom scheduler inputs with live preview and saving
        ['darkModeStartInput','darkModeEndInput'].forEach(id => {
            const input = document.getElementById(id);
            const display = document.getElementById(id.replace('Input',''));
            if (!input || !display) return;

            // Load saved value into input
            input.value = this.settings[id.replace('Input','')];

            // Update the display immediately
            this.updateSchedulerPreview(id, id.replace('Input',''));

            input.addEventListener('input', e => {
                const key = id.replace('Input','');        // "darkModeStart" or "darkModeEnd"
                this.settings[key] = e.target.value;       // Save to settings
                this.saveSettings();                        // Persist to localStorage
                this.updateSchedulerPreview(id, key);      // Update displayed AM/PM
                this.applyAppearanceMode();                 // Apply dark/light mode based on new times
            });
        });


        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if (slider && badge) {
            slider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value,10);
                this.applyFontSize();
                this.updateSliderFill(slider);
                badge.textContent = `${this.settings.fontSize}px`;
                this.saveSettings();
            });
        }

        ['focusOutline', 'motionEffects', 'highContrast', 'dyslexiaFont',
         'underlineLinks', 'loadingScreen', 'mouseTrail', 'liveStatus'].forEach(key => {
            const el = document.getElementById(`${key}Toggle`);
            if (!el) return;
            el.addEventListener('change', () => {
                this.settings[key] = el.checked ? 'enabled' : 'disabled';
                this.applySetting(key);
                this.saveSettings();
            });
        });

        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSettings());
    }

    // Live preview for custom scheduler
    updateSchedulerPreview(inputId, displayId) {
        const input = document.getElementById(inputId);
        const display = document.getElementById(displayId);
        if (!input || !display) return;
        const [h, m] = input.value.split(':').map(Number);
        let hour = h, period = 'AM';
        if(h === 0) hour = 12;
        else if(h === 12) period = 'PM';
        else if(h > 12) { hour = h-12; period = 'PM'; }
        display.textContent = `${hour}:${String(m).padStart(2,'0')} ${period}`;
    }

    updateSliderFill(slider) {
        const pct = ((slider.value - slider.min)/(slider.max - slider.min))*100;
        slider.style.background = `linear-gradient(90deg, var(--accent-color) 0%, var(--accent-color) ${pct}%, var(--slider-track-color) ${pct}%, var(--slider-track-color) 100%)`;
    }

    // ========================
    // Apply Settings
    // ========================
    applyAllSettings() {
        ['appearanceMode','themeStyle','accentColor','fontSize','focusOutline','motionEffects','highContrast',
         'dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'].forEach(key => this.applySetting(key));
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
            case 'loadingScreen': this.applyLoadingScreen(); break;
            case 'mouseTrail': this.applyMouseTrail(); break;
            case 'liveStatus': this.applyLiveStatus(); break;
        }
    }

    applyAppearanceMode() {
        const body = document.body;
        let isDark = false;

        if (this.settings.appearanceMode === 'dark') isDark = true;
        else if (this.settings.appearanceMode === 'light') isDark = false;
        else if (this.settings.appearanceMode === 'device') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        if(this.settings.darkModeScheduler !== 'off' && this.settings.appearanceMode === 'device') {
            isDark = this.checkScheduler();
        }

        body.classList.toggle('dark-mode', isDark);
        body.classList.toggle('light-mode', !isDark);
    }

    checkScheduler() {
        const now = new Date();
        const start = this.parseTime(this.settings.darkModeStart);
        const end = this.parseTime(this.settings.darkModeEnd);
        const current = now.getHours()*60 + now.getMinutes();

        if(this.settings.darkModeScheduler==='sunset') return now.getHours()>=18 || now.getHours()<6;
        if(this.settings.darkModeScheduler==='custom') return start<end ? current>=start && current<end : current>=start || current<end;

        return false;
    }

    parseTime(str){ const [h,m]=str.split(':').map(Number); return h*60+m; }

    applyThemeStyle() { document.body.classList.toggle('theme-tinted', this.settings.themeStyle==='tinted'); }
    applyAccentColor() { document.documentElement.style.setProperty('--accent-color',this.settings.accentColor); }
    applyFontSize() { document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`); }
    applyFocusOutline() { document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline==='disabled'); }
    applyMotionEffects() { document.body.classList.toggle('reduce-motion', this.settings.motionEffects==='disabled'); }
    applyHighContrast() { document.body.classList.toggle('high-contrast', this.settings.highContrast==='enabled'); }
    applyDyslexiaFont() { document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont==='enabled'); }
    applyUnderlineLinks() { document.body.classList.toggle('underline-links', this.settings.underlineLinks==='enabled'); }
    applyLoadingScreen() { 
        const ls = document.getElementById('loading-screen');
        if(!ls) return;
        if(this.settings.loadingScreen==='enabled') ls.style.display='flex';
        else ls.classList.add('loaded'); 
    }
    applyMouseTrail() { document.body.classList.toggle('mouse-trail-enabled', this.settings.mouseTrail==='enabled'); }
    applyLiveStatus() { document.body.classList.toggle('live-status-enabled', this.settings.liveStatus==='enabled'); }

    // ========================
    // Mouse Trail
    // ========================
    initMouseTrail() {
        const trailContainer = document.createElement('div');
        trailContainer.id = 'mouse-trail';
        document.body.appendChild(trailContainer);

        document.addEventListener('mousemove', e => {
            if(this.settings.mouseTrail!=='enabled') return;
            const dot = document.createElement('div');
            dot.className='trail';
            dot.style.left=`${e.clientX - 5}px`;
            dot.style.top=`${e.clientY - 5}px`;
            trailContainer.appendChild(dot);
            setTimeout(()=>dot.remove(),800);
        });
    }

    // ========================
    // Loading Screen
    // ========================
    initLoadingScreen() {
        const ls = document.getElementById('loading-screen');
        if(!ls) return;
        window.addEventListener('load',()=>{
            if(this.settings.loadingScreen==='enabled'){
                ls.classList.add('loaded');
                setTimeout(()=>{ ls.style.display='none'; },600);
            }
        });
    }

    // ========================
    // Scheduler Auto Update
    // ========================
    initSchedulerInterval() {
        if(this.schedulerInterval) clearInterval(this.schedulerInterval);
        this.schedulerInterval = setInterval(() => {
            if(this.settings.appearanceMode==='device' && this.settings.darkModeScheduler!=='off'){
                this.applyAppearanceMode();
            }
        }, 30000); // check every 30s
    }

    // ========================
    // Reset
    // ========================
    resetSettings() {
        if(confirm('Reset all settings to default values?')) {
            this.settings = { ...this.defaultSettings };
            this.saveSettings();
            this.initializeControls();
            this.applyAllSettings();
            alert('Settings reset to defaults.');
        }
    }
}

// Init
if(!window.settingsManagerInstance){
    window.settingsManagerInstance=new SettingsManager();
}
