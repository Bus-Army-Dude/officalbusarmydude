/**
 * settings.js
 * Manages website appearance, accessibility, and visual flair settings.
 * Settings persist in localStorage and apply immediately without refresh.
 */

class SettingsManager {
  constructor() {
    this.defaultSettings = {
      appearanceMode: "device", // device | light | dark
      themeStyle: "clear", // clear | tinted
      accentColor: "#3ddc84",
      darkModeScheduler: "off", // off | sunset | custom
      darkModeStart: "20:00",
      darkModeEnd: "06:00",
      fontSize: 16,
      focusOutline: false,
      hoverAnimations: true,
      highContrast: false,
      dyslexiaFont: false,
      underlineLinks: false,
      mouseTrail: false
    };

    this.settings = { ...this.defaultSettings, ...this.loadSettings() };

    // Initialize when DOM is ready
    document.addEventListener("DOMContentLoaded", () => {
      this.cacheElements();
      this.applySettings();
      this.bindEvents();
    });
  }

  cacheElements() {
    this.appearanceModeControl = document.getElementById("appearanceModeControl");
    this.themeStyleControl = document.getElementById("themeStyleControl");
    this.accentColorPicker = document.getElementById("accentColorPicker");
    this.darkModeSchedulerControl = document.getElementById("darkModeSchedulerControl");
    this.darkModeStart = document.getElementById("darkModeStart");
    this.darkModeEnd = document.getElementById("darkModeEnd");
    this.customTimeInputs = document.getElementById("customTimeInputs");

    this.textSizeSlider = document.getElementById("text-size-slider");
    this.textSizeValue = document.getElementById("textSizeValue");

    this.focusOutlineToggle = document.getElementById("focusOutlineToggle");
    this.hoverAnimationsToggle = document.getElementById("hoverAnimationsToggle");
    this.highContrastToggle = document.getElementById("highContrastToggle");
    this.dyslexiaFontToggle = document.getElementById("dyslexiaFontToggle");
    this.underlineLinksToggle = document.getElementById("underlineLinksToggle");
    this.mouseTrailToggle = document.getElementById("mouseTrailToggle");

    this.resetButton = document.getElementById("resetSettings");
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

  applySettings() {
    // Appearance Mode
    if (this.appearanceModeControl) {
      [...this.appearanceModeControl.querySelectorAll("button")].forEach(btn => {
        btn.classList.toggle("active", btn.dataset.value === this.settings.appearanceMode);
      });
      document.body.setAttribute("data-appearance", this.settings.appearanceMode);
    }

    // Theme Style
    if (this.themeStyleControl) {
      [...this.themeStyleControl.querySelectorAll("button")].forEach(btn => {
        btn.classList.toggle("active", btn.dataset.value === this.settings.themeStyle);
      });
      document.body.setAttribute("data-theme-style", this.settings.themeStyle);
    }

    // Accent Color
    if (this.accentColorPicker) {
      this.accentColorPicker.value = this.settings.accentColor;
      document.documentElement.style.setProperty("--accent-color", this.settings.accentColor);
    }

    // Dark Mode Scheduler
    if (this.darkModeSchedulerControl) {
      [...this.darkModeSchedulerControl.querySelectorAll("button")].forEach(btn => {
        btn.classList.toggle("active", btn.dataset.value === this.settings.darkModeScheduler);
      });
    }

    if (this.customTimeInputs) {
      this.customTimeInputs.style.display = this.settings.darkModeScheduler === "custom" ? "block" : "none";
    }

    if (this.darkModeStart) this.darkModeStart.value = this.settings.darkModeStart;
    if (this.darkModeEnd) this.darkModeEnd.value = this.settings.darkModeEnd;

    // Text Size
    if (this.textSizeSlider) {
      this.textSizeSlider.value = this.settings.fontSize;
    }
    if (this.textSizeValue) {
      this.textSizeValue.textContent = `${this.settings.fontSize}px`;
    }
    document.documentElement.style.fontSize = `${this.settings.fontSize}px`;

    // Accessibility Toggles
    if (this.focusOutlineToggle) this.focusOutlineToggle.checked = this.settings.focusOutline;
    document.body.classList.toggle("focus-outline", this.settings.focusOutline);

    if (this.hoverAnimationsToggle) this.hoverAnimationsToggle.checked = this.settings.hoverAnimations;
    document.body.classList.toggle("reduce-motion", !this.settings.hoverAnimations);

    if (this.highContrastToggle) this.highContrastToggle.checked = this.settings.highContrast;
    document.body.classList.toggle("high-contrast", this.settings.highContrast);

    if (this.dyslexiaFontToggle) this.dyslexiaFontToggle.checked = this.settings.dyslexiaFont;
    document.body.classList.toggle("dyslexia-font", this.settings.dyslexiaFont);

    if (this.underlineLinksToggle) this.underlineLinksToggle.checked = this.settings.underlineLinks;
    document.body.classList.toggle("underline-links", this.settings.underlineLinks);

    // Visual Flair
    if (this.mouseTrailToggle) this.mouseTrailToggle.checked = this.settings.mouseTrail;
    if (this.settings.mouseTrail) {
      this.enableMouseTrail();
    } else {
      this.disableMouseTrail();
    }
  }

  bindEvents() {
    // Appearance
    if (this.appearanceModeControl) {
      this.appearanceModeControl.addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") {
          this.settings.appearanceMode = e.target.dataset.value;
          this.saveSettings();
          this.applySettings();
        }
      });
    }

    if (this.themeStyleControl) {
      this.themeStyleControl.addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") {
          this.settings.themeStyle = e.target.dataset.value;
          this.saveSettings();
          this.applySettings();
        }
      });
    }

    if (this.accentColorPicker) {
      this.accentColorPicker.addEventListener("input", e => {
        this.settings.accentColor = e.target.value;
        this.saveSettings();
        this.applySettings();
      });
    }

    if (this.darkModeSchedulerControl) {
      this.darkModeSchedulerControl.addEventListener("click", e => {
        if (e.target.tagName === "BUTTON") {
          this.settings.darkModeScheduler = e.target.dataset.value;
          this.saveSettings();
          this.applySettings();
        }
      });
    }

    if (this.darkModeStart) {
      this.darkModeStart.addEventListener("change", e => {
        this.settings.darkModeStart = e.target.value;
        this.saveSettings();
        this.applySettings();
      });
    }

    if (this.darkModeEnd) {
      this.darkModeEnd.addEventListener("change", e => {
        this.settings.darkModeEnd = e.target.value;
        this.saveSettings();
        this.applySettings();
      });
    }

    // Text size
    if (this.textSizeSlider) {
      this.textSizeSlider.addEventListener("input", e => {
        this.settings.fontSize = parseInt(e.target.value, 10);
        this.saveSettings();
        this.applySettings();
      });
    }

    // Toggles
    const toggleMap = {
      focusOutlineToggle: "focusOutline",
      hoverAnimationsToggle: "hoverAnimations",
      highContrastToggle: "highContrast",
      dyslexiaFontToggle: "dyslexiaFont",
      underlineLinksToggle: "underlineLinks",
      mouseTrailToggle: "mouseTrail"
    };

    Object.entries(toggleMap).forEach(([id, key]) => {
      const el = this[id];
      if (el) {
        el.addEventListener("change", e => {
          this.settings[key] = e.target.checked;
          this.saveSettings();
          this.applySettings();
        });
      }
    });

    // Reset button
    if (this.resetButton) {
      this.resetButton.addEventListener("click", () => {
        if (confirm("Reset all settings to factory defaults?")) {
          this.settings = { ...this.defaultSettings };
          this.saveSettings();
          this.applySettings();
        }
      });
    }
  }

  // ===== Mouse Trail Effect =====
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

    document.removeEventListener("mousemove", this.mouseMoveHandler);
    document.querySelectorAll(".mouse-trail-dot").forEach(dot => dot.remove());
  }
}

// Initialize
new SettingsManager();
