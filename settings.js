/**
 * settings.js
 * Handles settings logic: appearance, accessibility, flair, and persistence.
 */
class SettingsManager {
  constructor() {
    this.defaultSettings = {
      appearanceMode: "device", // "device" | "light" | "dark"
      themeStyle: "clear",      // "clear" | "tinted"
      accentColor: "#3ddc84",
      darkModeScheduler: "off", // "off" | "sunset" | "custom"
      darkModeStart: "20:00",
      darkModeEnd: "07:00",
      textSize: 16,
      focusOutline: false,
      motionEffects: true,
      highContrast: false,
      dyslexiaFont: false,
      underlineLinks: false,
      mouseTrail: false,
    };

    this.settings = { ...this.defaultSettings };
    this.loadSettings();
    this.applySettings();
    this.bindEvents();
  }

  // Load saved settings
  loadSettings() {
    const saved = localStorage.getItem("settings");
    if (saved) {
      this.settings = { ...this.defaultSettings, ...JSON.parse(saved) };
    }
  }

  // Save settings
  saveSettings() {
    localStorage.setItem("settings", JSON.stringify(this.settings));
  }

  // Apply settings visually
  applySettings() {
    const body = document.body;

    // Appearance Mode
    body.classList.remove("light-mode", "dark-mode");
    if (this.settings.appearanceMode === "light") {
      body.classList.add("light-mode");
    } else if (this.settings.appearanceMode === "dark") {
      body.classList.add("dark-mode");
    } else {
      // follow device
      if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
        body.classList.add("dark-mode");
      } else {
        body.classList.add("light-mode");
      }
    }

    // Theme Style
    body.classList.remove("clear-mode", "tinted-mode");
    body.classList.add(
      this.settings.themeStyle === "tinted" ? "tinted-mode" : "clear-mode"
    );

    // Accent Color
    document.documentElement.style.setProperty(
      "--accent-color",
      this.settings.accentColor
    );
    document.getElementById("accentColorPicker").value =
      this.settings.accentColor;

    // Dark Mode Scheduler UI
    document.getElementById("darkModeScheduler").value =
      this.settings.darkModeScheduler;
    document.getElementById("darkModeStart").value =
      this.settings.darkModeStart;
    document.getElementById("darkModeEnd").value = this.settings.darkModeEnd;

    // Show/hide custom time inputs
    document.getElementById("customTimeInputs").style.display =
      this.settings.darkModeScheduler === "custom" ? "flex" : "none";

    // Text Size
    document.getElementById("textSizeValue").textContent =
      this.settings.textSize + "px";
    document.getElementById("text-size-slider").value =
      this.settings.textSize;
    document.documentElement.style.setProperty(
      "--base-font-size",
      this.settings.textSize + "px"
    );

    // Toggles
    document.getElementById("focusOutlineToggle").checked =
      this.settings.focusOutline;
    document.getElementById("hoverAnimationsToggle").checked =
      this.settings.motionEffects;
    document.getElementById("highContrastToggle").checked =
      this.settings.highContrast;
    document.getElementById("dyslexiaFontToggle").checked =
      this.settings.dyslexiaFont;
    document.getElementById("underlineLinksToggle").checked =
      this.settings.underlineLinks;
    document.getElementById("mouseTrailToggle").checked =
      this.settings.mouseTrail;

    // Toggle effects
    body.classList.toggle("focus-outline", this.settings.focusOutline);
    body.classList.toggle("reduced-motion", !this.settings.motionEffects);
    body.classList.toggle("high-contrast", this.settings.highContrast);
    body.classList.toggle("dyslexia-font", this.settings.dyslexiaFont);
    body.classList.toggle("underline-links", this.settings.underlineLinks);

    // Mouse Trail
    if (this.settings.mouseTrail) {
      this.enableMouseTrail();
    } else {
      this.disableMouseTrail();
    }

    // Update segmented controls
    this.updateSegmentedControls();
  }

  updateSegmentedControls() {
    document.querySelectorAll(".segmented-control").forEach((control) => {
      const value = this.settings[control.id.replace("Control", "")];
      control.querySelectorAll("button").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.value === value);
      });
    });
  }

  bindEvents() {
    // Segmented Controls
    document.querySelectorAll(".segmented-control button").forEach((btn) => {
      btn.addEventListener("click", () => {
        const controlId = btn.parentElement.id.replace("Control", "");
        this.settings[controlId] = btn.dataset.value;
        this.saveSettings();
        this.applySettings();
      });
    });

    // Accent Color Picker
    document
      .getElementById("accentColorPicker")
      .addEventListener("input", (e) => {
        this.settings.accentColor = e.target.value;
        this.saveSettings();
        this.applySettings();
      });

    // Dark Mode Scheduler
    document
      .getElementById("darkModeScheduler")
      .addEventListener("change", (e) => {
        this.settings.darkModeScheduler = e.target.value;
        this.saveSettings();
        this.applySettings();
      });

    document
      .getElementById("darkModeStart")
      .addEventListener("input", (e) => {
        this.settings.darkModeStart = e.target.value;
        this.saveSettings();
        this.applySettings();
      });

    document
      .getElementById("darkModeEnd")
      .addEventListener("input", (e) => {
        this.settings.darkModeEnd = e.target.value;
        this.saveSettings();
        this.applySettings();
      });

    // Text Size Slider
    document
      .getElementById("text-size-slider")
      .addEventListener("input", (e) => {
        this.settings.textSize = parseInt(e.target.value, 10);
        this.saveSettings();
        this.applySettings();
      });

    // Toggles
    [
      "focusOutlineToggle",
      "hoverAnimationsToggle",
      "highContrastToggle",
      "dyslexiaFontToggle",
      "underlineLinksToggle",
      "mouseTrailToggle",
    ].forEach((id) => {
      document.getElementById(id).addEventListener("change", (e) => {
        const key = id.replace("Toggle", "");
        if (key === "hoverAnimations") {
          this.settings.motionEffects = e.target.checked;
        } else if (key === "mouseTrail") {
          this.settings.mouseTrail = e.target.checked;
        } else {
          this.settings[key] = e.target.checked;
        }
        this.saveSettings();
        this.applySettings();
      });
    });

    // Reset button
    document
      .getElementById("resetSettings")
      .addEventListener("click", () => {
        if (confirm("Reset all settings to factory defaults?")) {
          this.settings = { ...this.defaultSettings };
          this.saveSettings();
          this.applySettings();
        }
      });

    // Live scheduler check
    setInterval(() => this.checkScheduler(), 60000);
    this.checkScheduler();
  }

  checkScheduler() {
    if (this.settings.darkModeScheduler === "off") return;

    const now = new Date();
    const [startHour, startMinute] = this.settings.darkModeStart.split(":").map(Number);
    const [endHour, endMinute] = this.settings.darkModeEnd.split(":").map(Number);
    const start = new Date(); start.setHours(startHour, startMinute, 0, 0);
    const end = new Date(); end.setHours(endHour, endMinute, 0, 0);

    let darkActive;
    if (this.settings.darkModeScheduler === "sunset") {
      // Simple heuristic (sunset 7pm, sunrise 7am)
      darkActive = now.getHours() >= 19 || now.getHours() < 7;
    } else {
      if (start < end) {
        darkActive = now >= start && now < end;
      } else {
        darkActive = now >= start || now < end;
      }
    }

    document.body.classList.toggle("dark-mode", darkActive);
    document.body.classList.toggle("light-mode", !darkActive);
  }

  // Mouse Trail Effect
  enableMouseTrail() {
    if (this.mouseTrailHandler) return;

    this.mouseTrailHandler = (e) => {
      const trail = document.createElement("div");
      trail.className = "mouse-trail";
      trail.style.left = e.pageX + "px";
      trail.style.top = e.pageY + "px";
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 1000);
    };

    document.addEventListener("mousemove", this.mouseTrailHandler);
  }

  disableMouseTrail() {
    if (this.mouseTrailHandler) {
      document.removeEventListener("mousemove", this.mouseTrailHandler);
      this.mouseTrailHandler = null;
    }
    document.querySelectorAll(".mouse-trail").forEach((el) => el.remove());
  }
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  new SettingsManager();
  document.getElementById("year").textContent = new Date().getFullYear();
});
