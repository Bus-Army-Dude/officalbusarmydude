/**
 * settings.js
 * Fully functional settings manager for live updates with your Liquid Glass CSS
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

        document.addEventListener('DOMContentLoaded', () => {
            this.initializeControls();
            this.applyAllSettings();
            this.setupEventListeners();
            this.initMouseTrail();
            this.initLoadingScreen();
            this.updateFooterYear();

            // Watch for system theme changes
            if (window.matchMedia) {
                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
                    if (this.settings.appearanceMode === 'device') this.applyAppearanceMode();
                });
            }

            // Watch for localStorage changes (for multi-tab sync)
            window.addEventListener('storage', e => {
                if (e.key === 'websiteSettings') {
                    this.settings = this.loadSettings();
                    this.applyAllSettings();
                    this.initializeControls();
                }
            });
        });
    }

    // ========================
    // Load & Save
    // ========================
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
        // Segmented controls (appearanceMode & themeStyle)
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
        const toggles = ['focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus'];
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
        // Segmented controls
        ['appearanceMode','themeStyle'].forEach(key => {
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

        // Accent color picker
        const accentPicker = document.getElementById('accentColorPicker');
        if (accentPicker) {
            accentPicker.addEventListener('input', e => {
                this.settings.accentColor = e.target.value;
                this.applyAccentColor();
                this.saveSettings();
            });
        }

        // Dark Mode Scheduler
        const schedulerSelect = document.getElementById('darkModeScheduler');
        if (schedulerSelect) {
            schedulerSelect.addEventListener('change', e => {
                this.settings.darkModeScheduler = e.target.value;
                this.applyAppearanceMode();
                this.saveSettings();
                document.getElementById('customTimeInputs').style.display = this.settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
            });
        }

        // Custom times
        ['darkModeStart','darkModeEnd'].forEach(id => {
            const input = document.getElementById(id);
            if (!input) return;
            input.addEventListener('change', e => {
                this.settings[id] = e.target.value;
                this.saveSettings();
                this.applyAppearanceMode();
            });
        });

        // Text Size Slider
        const slider = document.getElementById('text-size-slider');
        if (slider) {
            slider.addEventListener('input', e => {
                this.settings.fontSize = parseInt(e.target.value,10);
                this.applyFontSize();
                this.updateSliderFill(slider);
                this.saveSettings();
            });
        }

        // iOS-style toggles
        ['focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus']
        .forEach(key => {
            const el = document.getElementById(`${key}Toggle`);
            if (!el) return;
            el.addEventListener('change', () => {
                this.settings[key] = el.checked ? 'enabled' : 'disabled';
                this.applySetting(key);
                this.saveSettings();
            });
        });

        // Reset button
        const resetBtn = document.getElementById('resetSettings');
        if (resetBtn) resetBtn.addEventListener('click', () => this.resetSettings());
    }

    updateSliderFill(slider) {
        const pct = ((slider.value - slider.min)/(slider.max - slider.min))*100;
        slider.style.setProperty('--slider-value-percentage', `${pct}%`);
    }

    // ========================
    // Apply Settings
    // ========================
    applyAllSettings() {
        ['appearanceMode','themeStyle','accentColor','fontSize','focusOutline','motionEffects','highContrast','dyslexiaFont','underlineLinks','loadingScreen','mouseTrail','liveStatus']
        .forEach(key => this.applySetting(key));
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

        if(this.settings.appearanceMode==='dark') isDark=true;
        else if(this.settings.appearanceMode==='light') isDark=false;
        else if(this.settings.appearanceMode==='device') isDark=window.matchMedia('(prefers-color-scheme: dark)').matches;

        // Scheduler override
        if(this.settings.darkModeScheduler!=='off') isDark=this.checkScheduler();

        body.classList.toggle('dark-mode', isDark);
        body.classList.toggle('light-mode', !isDark);
    }

    checkScheduler() {
        const now=new Date();
        const start=this.parseTime(this.settings.darkModeStart);
        const end=this.parseTime(this.settings.darkModeEnd);
        const current=now.getHours()*60+now.getMinutes();
        if(this.settings.darkModeScheduler==='sunset') return now.getHours()>=18||now.getHours()<6;
        if(this.settings.darkModeScheduler==='custom') return start<end ? current>=start&&current<end : current>=start||current<end;
        return false;
    }

    parseTime(str){ const [h,m]=str.split(':').map(Number); return h*60+m; }

    applyThemeStyle() { document.body.classList.toggle('tinted-mode', this.settings.themeStyle==='tinted'); }
    applyAccentColor() { document.documentElement.style.setProperty('--accent-color',this.settings.accentColor); }
    applyFontSize() { document.documentElement.style.setProperty('--font-size-base', `${this.settings.fontSize}px`); }

    applyFocusOutline() { document.body.classList.toggle('focus-outline', this.settings.focusOutline==='enabled'); }
    applyMotionEffects() { document.body.classList.toggle('motion-disabled', this.settings.motionEffects==='disabled'); }
    applyHighContrast() { document.body.classList.toggle('high-contrast', this.settings.highContrast==='enabled'); }
    applyDyslexiaFont() { document.body.classList.toggle('dyslexia-font', this.settings.dyslexiaFont==='enabled'); }
    applyUnderlineLinks() { document.body.classList.toggle('underline-links', this.settings.underlineLinks==='enabled'); }
    applyLoadingScreen() { 
        const ls = document.getElementById('loading-screen');
        if(!ls) return;
        if(this.settings.loadingScreen==='enabled') ls.style.display='flex';
        else ls.classList.add('loaded'); 
    }
    applyMouseTrail() { /* handled by initMouseTrail */ }
    applyLiveStatus() { document.body.classList.toggle('live-status-enabled', this.settings.liveStatus==='enabled'); }

    // ========================
    // Mouse Trail
    // ========================
    initMouseTrail() {
        const trailContainer = document.getElementById('mouse-trail') || (() => {
            const div = document.createElement('div');
            div.id='mouse-trail';
            document.body.appendChild(div);
            return div;
        })();

        document.addEventListener('mousemove', e => {
            if(this.settings.mouseTrail!=='enabled') return;
            const dot = document.createElement('div');
            dot.className='mouse-trail-dot';
            dot.style.left=`${e.clientX}px`;
            dot.style.top=`${e.clientY}px`;
            trailContainer.appendChild(dot);
            setTimeout(()=>dot.remove(),500);
        });
    }

    // ========================
    // Loading Screen
    // ========================
    initLoadingScreen() {
        const ls=document.getElementById('loading-screen');
        if(!ls) return;
        window.addEventListener('load',()=>{
            if(this.settings.loadingScreen==='enabled'){
                ls.classList.add('loaded');
                setTimeout(()=>{ ls.style.display='none'; },600);
            }
        });
    }

    // ========================
    // Reset Settings
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

    // ========================
    // Footer year
    // ========================
    updateFooterYear() {
        const yearSpan = document.getElementById('year');
        if(yearSpan) yearSpan.textContent = new Date().getFullYear();
    }
}

const mouseTrailToggle = document.getElementById('mouseTrailToggle');
const trailContainer = document.createElement('div');
trailContainer.id = 'mouse-trail';
document.body.appendChild(trailContainer);

document.addEventListener('mousemove', (e) => {
  if (!mouseTrailToggle.checked) return;

  const dot = document.createElement('div');
  dot.classList.add('mouse-trail-dot');
  dot.style.left = `${e.clientX}px`;
  dot.style.top = `${e.clientY}px`;
  trailContainer.appendChild(dot);

  setTimeout(() => {
    dot.remove();
  }, 500); // matches CSS fade duration
});

const darkModeScheduler = document.getElementById('darkModeScheduler');
const customTimeInputs = document.getElementById('customTimeInputs');

darkModeScheduler.addEventListener('change', () => {
  if (darkModeScheduler.value === 'custom') {
    customTimeInputs.style.display = 'flex';
  } else {
    customTimeInputs.style.display = 'none';
  }
});

// Initialize singleton
if(!window.settingsManagerInstance) window.settingsManagerInstance = new SettingsManager();
