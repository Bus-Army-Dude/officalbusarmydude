/**
 * settings.js
 * Manages website settings with live updates.
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
            this.initMouseTrail();
            this.initLoadingScreen();

            // Watch for system theme changes
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this.deviceThemeMedia.addEventListener('change', () => this.applyAppearanceMode());
            }

            // Watch for localStorage changes across tabs
            window.addEventListener('storage', e => {
                if (e.key === 'websiteSettings') {
                    this.settings = this.loadSettings();
                    this.applyAllSettings();
                    this.initializeControls();
                }
            });
        });
    }

    loadSettings() {
        try {
            const stored = localStorage.getItem('websiteSettings');
            return stored ? {...this.defaultSettings, ...JSON.parse(stored)} : {...this.defaultSettings};
        } catch { return {...this.defaultSettings}; }
    }

    saveSettings() { localStorage.setItem('websiteSettings', JSON.stringify(this.settings)); }

    initializeControls() {
        // Appearance Mode
        const appearance = document.getElementById('appearanceModeControl');
        if (appearance) appearance.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.appearanceMode));

        // Theme Style
        const theme = document.getElementById('themeStyleControl');
        if (theme) theme.querySelectorAll('button').forEach(btn => btn.classList.toggle('active', btn.dataset.value === this.settings.themeStyle));

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
        ['focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'].forEach(key => this.setToggle(`${key}Toggle`, this.settings[key]));
    }

    setToggle(id,state) {
        const el = document.getElementById(id);
        if (el) el.checked = (state === 'enabled');
    }

    setupEventListeners() {
        // Appearance Mode
        const appearance = document.getElementById('appearanceModeControl');
        if (appearance) appearance.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (btn) { this.settings.appearanceMode = btn.dataset.value; this.applyAppearanceMode(); this.saveSettings(); this.initializeControls(); }
        });

        // Theme Style
        const theme = document.getElementById('themeStyleControl');
        if (theme) theme.addEventListener('click', e => {
            const btn = e.target.closest('button');
            if (btn) { this.settings.themeStyle = btn.dataset.value; this.applyThemeStyle(); this.saveSettings(); this.initializeControls(); }
        });

        // Accent
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) accentPicker.addEventListener('input', e => { this.settings.accentColor = e.target.value; this.applyAccentColor(); this.saveSettings(); });

        // Scheduler
        const scheduler = document.getElementById('darkModeScheduler');
        if (scheduler) scheduler.addEventListener('change', e => { this.settings.darkModeScheduler = e.target.value; this.applyAppearanceMode(); this.saveSettings(); this.initializeControls(); });
        const start = document.getElementById('darkModeStart');
        const end = document.getElementById('darkModeEnd');
        if (start && end) {
            start.addEventListener('change', e => { this.settings.darkModeStart = e.target.value; this.saveSettings(); this.applyAppearanceMode(); });
            end.addEventListener('change', e => { this.settings.darkModeEnd = e.target.value; this.saveSettings(); this.applyAppearanceMode(); });
        }

        // Text Size
        const slider = document.getElementById('text-size-slider');
        if (slider) slider.addEventListener('input', e => {
            this.settings.fontSize = parseInt(e.target.value,10);
            this.applyFontSize();
            this.updateSliderProgress(slider);
            this.saveSettings();
            const badge = document.getElementById('textSizeValue');
            if (badge) badge.textContent = `${this.settings.fontSize}px`;
        });

        // Generic toggles
        ['focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'].forEach(key => this.bindToggle(`${key}Toggle`, key, this[`apply${this.capitalize(key)}`].bind(this)));

        // Reset Button
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSettings());
    }

    bindToggle(id,key,applyFn){
        const el = document.getElementById(id);
        if(el) el.addEventListener('change', e => { this.settings[key] = e.target.checked ? 'enabled':'disabled'; applyFn(); this.saveSettings(); });
    }

    // ========================
    // Apply Settings
    // ========================
    applyAllSettings(){
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

    applyAppearanceMode(){
        const body = document.body;
        let isDark = false;
        if(this.settings.appearanceMode==='dark') isDark = true;
        else if(this.settings.appearanceMode==='light') isDark = false;
        else if(this.settings.appearanceMode==='device') isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Scheduler
        if(this.settings.darkModeScheduler!=='off') isDark = this.checkScheduler();

        body.classList.toggle('dark-mode',isDark);
        body.classList.toggle('light-mode',!isDark);
    }

    checkScheduler(){
        const now = new Date();
        const start = this.parseTime(this.settings.darkModeStart);
        const end = this.parseTime(this.settings.darkModeEnd);
        const current = now.getHours()*60+now.getMinutes();
        if(this.settings.darkModeScheduler==='sunset') return (now.getHours()>=18 || now.getHours()<6);
        if(this.settings.darkModeScheduler==='custom') return start<end?current>=start && current<end: current>=start || current<end;
        return false;
    }

    parseTime(str){ const [h,m]=str.split(':').map(Number); return h*60+m; }

    applyThemeStyle(){ document.body.classList.toggle('theme-tinted', this.settings.themeStyle==='tinted'); }
    applyAccentColor(){ document.documentElement.style.setProperty('--accent-color', this.settings.accentColor); }
    applyFontSize(){ document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`); }
    applyFocusOutline(){ document.body.classList.toggle('focus-outline-disabled', this.settings.focusOutline==='disabled'); }
    applyMotionEffects(){ document.body.classList.toggle('motion-disabled', this.settings.motionEffects==='disabled'); }
    applyHighContrast(){ document.body.classList.toggle('high-contrast', this.settings.highContrast==='enabled'); }
    applyDyslexiaFont(){ document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont==='enabled'); }
    applyUnderlineLinks(){ document.body.classList.toggle('underline-links', this.settings.underlineLinks==='enabled'); }

    applyLoadingScreen(){ 
        const ls = document.getElementById('loading-screen');
        if(!ls) return;
        if(this.settings.loadingScreen==='enabled') ls.style.display='flex';
        else ls.classList.add('loaded'); 
    }

    applyMouseTrail(){
        const trail = document.getElementById('mouse-trail');
        if(!trail) return;
        trail.style.display = (this.settings.mouseTrail==='enabled')?'block':'none';
    }

    applyLiveStatus(){ document.body.classList.toggle('live-status-enabled', this.settings.liveStatus==='enabled'); }

    // ------------------------- Mouse Trail -------------------------
    initMouseTrail(){
        const trail = document.getElementById('mouse-trail');
        if(!trail) return;
        const circles=[];
        document.addEventListener('mousemove', e=>{
            if(this.settings.mouseTrail!=='enabled') return;
            const div=document.createElement('div');
            div.className='trail';
            div.style.left=`${e.clientX}px`;
            div.style.top=`${e.clientY}px`;
            trail.appendChild(div);
            setTimeout(()=>trail.removeChild(div),800);
        });
    }

    // ------------------------- Loading Screen -------------------------
    initLoadingScreen(){
        const ls = document.getElementById('loading-screen');
        if(!ls) return;
        window.addEventListener('load',()=>{ ls.classList.add('loaded'); setTimeout(()=>ls.style.display='none',500); });
    }

    // ------------------------- Slider Progress -------------------------
    updateSliderProgress(slider){
        const percent=((slider.value-slider.min)/(slider.max-slider.min))*100;
        slider.style.background=`linear-gradient(90deg, var(--slider-track-filled-color) 0%, var(--slider-track-filled-color) ${percent}%, var(--slider-track-color) ${percent}%, var(--slider-track-color) 100%)`;
    }

    // ------------------------- Utility -------------------------
    resetSettings(){
        if(confirm('Reset all settings to default?')){
            this.settings={...this.defaultSettings};
            this.saveSettings();
            this.initializeControls();
            this.applyAllSettings();
            alert('Settings reset.');
        }
    }

    capitalize(str){ return str.charAt(0).toUpperCase()+str.slice(1); }
}

// Initialize
if(!window.settingsManagerInstance) window.settingsManagerInstance = new SettingsManager();

// Set current year in footer
const yearSpan = document.getElementById('year');
if(yearSpan) yearSpan.textContent = new Date().getFullYear();
