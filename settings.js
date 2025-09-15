/**
 * settings.js
 * Manages website appearance, accessibility, and visual flair settings.
 * Settings persist in localStorage and apply immediately without refresh.
 */

class SettingsManager {
  constructor() {
    this.defaultSettings = {
      appearanceMode: "device",
      accentColor: "#3ddc84",
      darkModeScheduler: "off",
      fontSize: 16,
      focusOutline: true,
      hoverAnimations: true,
      highContrast: false,
      dyslexiaFont: false,
      underlineLinks: false,
      mouseTrail: false
    };

    this.settings = { ...this.defaultSettings, ...this.loadSettings() };

    // Apply styles immediately to the <html> tag to prevent flashing
    this.applyGlobalStyles();

    // Set up listeners and controls once the page is fully loaded
    document.addEventListener("DOMContentLoaded", () => {
      this.cacheElements();
      this.applyControlStates();
      this.bindEvents();
      this.updateCopyrightYear();
    });

    // Listen for changes from other tabs
    window.addEventListener('storage', (event) => {
      if (event.key === 'settings') {
        this.settings = this.loadSettings();
        this.saveAndApply();
      }
    });
  }

  loadSettings() {
    try {
      return JSON.parse(localStorage.getItem("settings")) || {};
    } catch {
      return {};
    }
  }

  saveSettings() {
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }

  applyGlobalStyles() {
    const s = this.settings;
    const root = document.documentElement; // Target the <html> element

    // Appearance Mode
    if (s.appearanceMode === 'device') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      root.classList.toggle('dark-mode', prefersDark);
    } else {
      root.classList.toggle('dark-mode', s.appearanceMode === 'dark');
    }

    // Accent Color & Font Size
    root.style.setProperty("--accent-color", s.accentColor);
    root.style.fontSize = `${s.fontSize}px`;

    // Accessibility & Visuals
    root.classList.toggle("focus-outline", s.focusOutline);
    root.classList.toggle("reduce-motion", !s.hoverAnimations);
    root.classList.toggle("high-contrast", s.highContrast);
    root.classList.toggle("dyslexia-font", s.dyslexiaFont);
    root.classList.toggle("underline-links", s.underlineLinks);

    // Mouse Trail
    document.addEventListener('DOMContentLoaded', () => {
        if (s.mouseTrail) this.enableMouseTrail();
        else this.disableMouseTrail();
    });
  }

  applyControlStates() {
    if (!document.getElementById("settings-page-identifier")) return; // Only run on settings page
    
    const s = this.settings;

    this.updateButtonGroup(this.appearanceModeControl, s.appearanceMode);
    this.accentColorPicker.value = s.accentColor;
    this.updateButtonGroup(this.darkModeSchedulerControl, s.darkModeScheduler);
    
    const isSchedulerOn = s.darkModeScheduler !== 'off';
    this.appearanceModeControl.querySelectorAll("button").forEach(btn => { btn.disabled = isSchedulerOn; });

    this.textSizeSlider.value = s.fontSize;
    const min = this.textSizeSlider.min || 12;
    const max = this.textSizeSlider.max || 24;
    const percentage = ((s.fontSize - min) / (max - min)) * 100;
    this.textSizeSlider.style.setProperty('--slider-value-percentage', `${percentage}%`);

    this.focusOutlineToggle.checked = s.focusOutline;
    this.hoverAnimationsToggle.checked = s.hoverAnimations;
    this.highContrastToggle.checked = s.highContrast;
    this.dyslexiaFontToggle.checked = s.dyslexiaFont;
    this.underlineLinksToggle.checked = s.underlineLinks;
    this.mouseTrailToggle.checked = s.mouseTrail;
  }

  saveAndApply() {
    this.saveSettings();
    this.applyGlobalStyles();
    this.applyControlStates();
  }
  
  // (Keep all your other methods like cacheElements, bindEvents, helpers, etc., here)
  // ... the rest of your class methods from the previous version ...
  cacheElements() {
    // This script runs on all pages, so it's okay if these are null
    this.appearanceModeControl = document.getElementById("appearanceModeControl");
    this.accentColorPicker = document.getElementById("accentColorPicker");
    this.darkModeSchedulerControl = document.getElementById("darkModeSchedulerControl");
    this.customTimeInputs = document.getElementById("customTimeInputs");
    this.textSizeSlider = document.getElementById("text-size-slider");
    this.resetButton = document.getElementById("resetSettings");
    
    // Toggles
    this.focusOutlineToggle = document.getElementById("focusOutlineToggle");
    this.hoverAnimationsToggle = document.getElementById("hoverAnimationsToggle");
    this.highContrastToggle = document.getElementById("highContrastToggle");
    this.dyslexiaFontToggle = document.getElementById("dyslexiaFontToggle");
    this.underlineLinksToggle = document.getElementById("underlineLinksToggle");
    this.mouseTrailToggle = document.getElementById("mouseTrailToggle");
  }

  bindEvents() {
    // Appearance
    this.appearanceModeControl?.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        this.settings.appearanceMode = e.target.dataset.value;
        this.saveAndApply();
      }
    });

    this.accentColorPicker?.addEventListener("input", e => {
      this.settings.accentColor = e.target.value;
      this.saveAndApply();
    });

    this.darkModeSchedulerControl?.addEventListener("click", e => {
      if (e.target.tagName === "BUTTON") {
        this.settings.darkModeScheduler = e.target.dataset.value;
        this.saveAndApply();
      }
    });

    // Text size
    this.textSizeSlider?.addEventListener("input", e => {
      this.settings.fontSize = parseInt(e.target.value, 10);
      this.saveAndApply();
    });

    // Toggles
    const toggleMap = {
      focusOutlineToggle: "focusOutline",
      hoverAnimationsToggle: "hoverAnimations",
      highContrastToggle: "highContrast",
      dyslexiaFontToggle: "dyslexiaFont",
      underlineLinksToggle: "underlineLinks",
      mouseTrailToggle: "mouseTrail"
    };

    Object.entries(toggleMap).forEach(([elementId, settingKey]) => {
      this[elementId]?.addEventListener("change", e => {
        this.settings[settingKey] = e.target.checked;
        this.saveAndApply();
      });
    });

    // Reset button
    this.resetButton?.addEventListener("click", () => {
      if (confirm("Reset all settings to factory defaults?")) {
        this.settings = { ...this.defaultSettings };
        this.saveAndApply();
      }
    });
  }
    updateButtonGroup(container, activeValue) {
    if (!container) return;
    [...container.querySelectorAll("button")].forEach(btn => {
      btn.classList.toggle("active", btn.dataset.value === activeValue);
    });
  }

  updateCopyrightYear() {
    const yearSpan = document.getElementById('year');
    if (yearSpan) {
      yearSpan.textContent = new Date().getFullYear();
    }
  }

  enableMouseTrail() {
    if (this.mouseTrailEnabled) return;
    this.mouseTrailEnabled = true;
    this.mouseMoveHandler = e => {
      const dot = document.createElement("div");
      dot.className = "mouse-trail-dot";
      dot.style.left = `${e.pageX}px`;
      dot.style.top = `${e.pageY}px`;
      document.body.appendChild(dot);
      setTimeout(() => dot.remove(), 500);
    };
    document.addEventListener("mousemove", this.mouseMoveHandler);
  }

  disableMouseTrail() {
    if (!this.mouseTrailEnabled) return;
    this.mouseTrailEnabled = false;
    if (this.mouseMoveHandler) {
        document.removeEventListener("mousemove", this.mouseMoveHandler);
    }
    document.querySelectorAll(".mouse-trail-dot").forEach(dot => dot.remove());
  }
}


// Initialize the Settings Manager
new SettingsManager();
