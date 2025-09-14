/**
 * settings.js
 * Fully reactive settings manager for Caleb's website.
 * All changes apply immediately without page refresh.
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

            // Watch for system theme changes
            if (window.matchMedia) {
                this.deviceThemeMedia = window.matchMedia('(prefers-color-scheme: dark)');
                this.deviceThemeMedia.addEventListener('change', () => {
                    if (this.settings.appearanceMode === 'device') this.applyAppearanceMode();
                });
            }

            // Set year in footer
            const yearSpan = document.getElementById('year');
            if (yearSpan) yearSpan.textContent = new Date().getFullYear();

            // Initialize mouse trail
            this.initMouseTrail();

            // Initialize loading screen
            this.hideLoadingScreen();
        });
    }

    // Load and save
    loadSettings() {
        try {
            const stored = localStorage.getItem('websiteSettings');
            return stored ? { ...this.defaultSettings, ...JSON.parse(stored) } : { ...this.defaultSettings };
        } catch { return { ...this.defaultSettings }; }
    }
    saveSettings() { localStorage.setItem('websiteSettings', JSON.stringify(this.settings)); }

    // ========================
    // Initialize UI Controls
    // ========================
    initializeControls() {
        // Appearance Mode
        this.activateButtons('appearanceModeControl', this.settings.appearanceMode);
        this.activateButtons('themeStyleControl', this.settings.themeStyle);

        // Accent Color
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) accentPicker.value = this.settings.accentColor;

        // Scheduler
        const schedulerSelect = document.getElementById('darkModeScheduler');
        if (schedulerSelect) schedulerSelect.value = this.settings.darkModeScheduler;
        const customInputs = document.getElementById('customTimeInputs');
        if (customInputs) {
            customInputs.style.display = (this.settings.darkModeScheduler === 'custom') ? 'flex' : 'none';
            document.getElementById('darkModeStart').value = this.settings.darkModeStart;
            document.getElementById('darkModeEnd').value = this.settings.darkModeEnd;
        }

        // Text Size Slider
        const slider = document.getElementById('text-size-slider');
        const badge = document.getElementById('textSizeValue');
        if (slider && badge) {
            slider.value = this.settings.fontSize;
            badge.textContent = `${this.settings.fontSize}px`;
            this.updateSliderFill(slider);
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

    activateButtons(controlId, value) {
        const control = document.getElementById(controlId);
        if (!control) return;
        control.querySelectorAll('button').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.value === value);
        });
    }

    setToggle(id, state) {
        const el = document.getElementById(id);
        if (el) el.checked = (state === 'enabled');
    }

    // ========================
    // Event Listeners
    // ========================
    setupEventListeners() {
        // Buttons
        this.bindButtons('appearanceModeControl', 'appearanceMode', this.applyAppearanceMode.bind(this));
        this.bindButtons('themeStyleControl', 'themeStyle', this.applyThemeStyle.bind(this));

        // Accent Picker
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) accentPicker.addEventListener('input', e => {
            this.settings.accentColor = e.target.value;
            this.applyAccentColor();
            this.saveSettings();
        });

        // Scheduler
        const schedulerSelect = document.getElementById('darkModeScheduler');
        if (schedulerSelect) {
            schedulerSelect.addEventListener('change', e => {
                this.settings.darkModeScheduler = e.target.value;
                document.getElementById('customTimeInputs').style.display = (e.target.value === 'custom') ? 'flex' : 'none';
                this.applyAppearanceMode();
                this.saveSettings();
            });
        }
        ['darkModeStart','darkModeEnd'].forEach(id=>{
            const el=document.getElementById(id);
            if(el) el.addEventListener('change', e=> { this.settings[id] = e.target.value; this.saveSettings(); this.applyAppearanceMode(); });
        });

        // Text Slider
        const slider = document.getElementById('text-size-slider');
        if(slider){
            slider.addEventListener('input', e=>{
                this.settings.fontSize = parseInt(e.target.value,10);
                this.applyFontSize();
                this.updateSliderFill(slider);
                this.saveSettings();
                const badge = document.getElementById('textSizeValue');
                if(badge) badge.textContent = `${this.settings.fontSize}px`;
            });
        }

        // Toggles
        this.bindToggle('focusOutlineToggle','focusOutline', this.applyFocusOutline.bind(this));
        this.bindToggle('hoverAnimationsToggle','motionEffects', this.applyMotionEffects.bind(this));
        this.bindToggle('highContrastToggle','highContrast', this.applyHighContrast.bind(this));
        this.bindToggle('dyslexiaFontToggle','dyslexiaFont', this.applyDyslexiaFont.bind(this));
        this.bindToggle('underlineLinksToggle','underlineLinks', this.applyUnderlineLinks.bind(this));
        this.bindToggle('loadingScreenToggle','loadingScreen', this.applyLoadingScreen.bind(this));
        this.bindToggle('mouseTrailToggle','mouseTrail', this.applyMouseTrail.bind(this));
        this.bindToggle('liveStatusToggle','liveStatus', this.applyLiveStatus.bind(this));

        // Reset Button
        const resetBtn=document.getElementById('resetSettings');
        if(resetBtn) resetBtn.addEventListener('click', ()=>this.resetSettings());
    }

    bindButtons(controlId, key, applyFn){
        const control=document.getElementById(controlId);
        if(!control) return;
        control.addEventListener('click', e=>{
            const btn=e.target.closest('button');
            if(btn){
                this.settings[key]=btn.dataset.value;
                applyFn();
                this.saveSettings();
                this.activateButtons(controlId,this.settings[key]);
            }
        });
    }

    bindToggle(id,key,applyFn){
        const el=document.getElementById(id);
        if(el){
            el.addEventListener('change', e=>{
                this.settings[key] = e.target.checked ? 'enabled' : 'disabled';
                applyFn();
                this.saveSettings();
            });
        }
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
        const body=document.body;
        let isDark=false;

        if(this.settings.appearanceMode==='dark') isDark=true;
        else if(this.settings.appearanceMode==='light') isDark=false;
        else if(this.settings.appearanceMode==='device') {
            isDark=window.matchMedia('(prefers-color-scheme: dark)').matches;
            if(this.settings.darkModeScheduler!=='off') isDark=this.checkScheduler();
        }

        body.classList.toggle('dark-mode',isDark);
        body.classList.toggle('light-mode',!isDark);
    }

    checkScheduler(){
        const now=new Date();
        const current=now.getHours()*60+now.getMinutes();
        const start=this.parseTime(this.settings.darkModeStart);
        const end=this.parseTime(this.settings.darkModeEnd);
        if(this.settings.darkModeScheduler==='sunset') return (now.getHours()>=18||now.getHours()<6);
        if(this.settings.darkModeScheduler==='custom'){
            if(start<end) return current>=start && current<end;
            else return current>=start||current<end;
        }
        return false;
    }

    parseTime(str){ const [h,m]=str.split(':').map(Number); return h*60+m; }

    applyThemeStyle(){ document.body.classList.toggle('theme-tinted',this.settings.themeStyle==='tinted'); }
    applyAccentColor(){ document.documentElement.style.setProperty('--accent-color',this.settings.accentColor); document.querySelectorAll('.trail').forEach(t=>t.style.background=this.settings.accentColor); }
    applyFontSize(){ document.documentElement.style.setProperty('--font-size-base',`${this.settings.fontSize}px`); }
    applyFocusOutline(){ document.body.classList.toggle('focus-outline-disabled',this.settings.focusOutline==='disabled'); }
    applyMotionEffects(){ document.body.classList.toggle('motion-disabled',this.settings.motionEffects==='disabled'); }
    applyHighContrast(){ document.body.classList.toggle('high-contrast',this.settings.highContrast==='enabled'); }
    applyDyslexiaFont(){ document.body.classList.toggle('dyslexia-font',this.settings.dyslexiaFont==='enabled'); }
    applyUnderlineLinks(){ document.body.classList.toggle('underline-links',this.settings.underlineLinks==='enabled'); }

    // ==========================
    // Loading Screen
    // ==========================
    applyLoadingScreen(){
        if(this.settings.loadingScreen==='enabled') document.getElementById('loading-screen')?.classList.remove('loaded');
        else this.hideLoadingScreen();
    }
    hideLoadingScreen(){
        const ls=document.getElementById('loading-screen');
        if(ls) ls.classList.add('loaded');
    }

    // ==========================
    // Mouse Trail
    // ==========================
    initMouseTrail(){
        if(this.settings.mouseTrail!=='enabled') return;
        const trailContainer=document.createElement('div'); trailContainer.id='mouse-trail'; document.body.appendChild(trailContainer);
        document.addEventListener('mousemove', e=>{
            if(this.settings.mouseTrail!=='enabled') return;
            const dot=document.createElement('div'); dot.className='trail'; dot.style.left=`${e.clientX}px`; dot.style.top=`${e.clientY}px`;
            trailContainer.appendChild(dot);
            setTimeout(()=>dot.remove(),800);
        });
    }
    applyMouseTrail(){ this.settings.mouseTrail==='enabled'?this.initMouseTrail():document.getElementById('mouse-trail')?.remove(); }

    // ==========================
    // Live Status
    // ==========================
    applyLiveStatus(){ document.body.classList.toggle('live-status-enabled',this.settings.liveStatus==='enabled'); }

    // ==========================
    // Utilities
    // ==========================
    updateSliderFill(slider){
        const percent=(slider.value-slider.min)/(slider.max-slider.min)*100;
        slider.style.background=`linear-gradient(90deg, var(--slider-track-filled-color) 0%, var(--slider-track-filled-color) ${percent}%, var(--slider-track-color) ${percent}%, var(--slider-track-color) 100%)`;
    }

    resetSettings(){
        if(confirm('Reset all settings to default values?')){
            this.settings={...this.defaultSettings};
            this.saveSettings();
            this.initializeControls();
            this.applyAllSettings();
            alert('Settings reset to defaults.');
        }
    }
}

// Initialize
if(!window.settingsManagerInstance) window.settingsManagerInstance=new SettingsManager();
