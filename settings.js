// ==========================
// SETTINGS.JS
// ==========================

// Default settings
const defaultSettings = {
  appearanceMode: 'device', // device / light / dark
  accentColor: '#3ddc84',
  textSize: 16,
  focusOutline: true,
  highContrast: false,
  dyslexiaFont: false,
  underlineLinks: false,
  mouseTrail: false,
  darkModeScheduler: 'off', // off / sunset / custom
  darkModeStart: '07:00',
  darkModeEnd: '19:30'
};

// Helper: Save settings to localStorage
function saveSettings(settings) {
  localStorage.setItem('userSettings', JSON.stringify(settings));
}

// Helper: Load settings from localStorage
function loadSettings() {
  const saved = localStorage.getItem('userSettings');
  if (saved) {
    return { ...defaultSettings, ...JSON.parse(saved) };
  }
  return { ...defaultSettings };
}

// ==========================
// Initialize
// ==========================
const settings = loadSettings();

// Elements
const appearanceButtons = document.querySelectorAll('#appearanceModeControl button');
const accentPicker = document.getElementById('accentColorPicker');
const accentPreview = document.getElementById('accentColorPreview');
const textSizeSlider = document.getElementById('text-size-slider');
const textSizeBadge = document.getElementById('textSizeValue');
const focusOutlineToggle = document.getElementById('focusOutlineToggle');
const highContrastToggle = document.getElementById('highContrastToggle');
const dyslexiaFontToggle = document.getElementById('dyslexiaFontToggle');
const underlineLinksToggle = document.getElementById('underlineLinksToggle');
const mouseTrailToggle = document.getElementById('mouseTrailToggle');
const darkModeScheduler = document.getElementById('darkModeScheduler');
const customTimeInputs = document.getElementById('customTimeInputs');
const darkModeStartInput = document.getElementById('darkModeStartInput');
const darkModeEndInput = document.getElementById('darkModeEndInput');
const darkModeStartDisplay = document.getElementById('darkModeStart');
const darkModeEndDisplay = document.getElementById('darkModeEnd');
const resetButton = document.getElementById('resetSettings');

// ==========================
// Utility Functions
// ==========================

// Convert 24h to 12h format
function formatTime12h(time24) {
  const [hour, minute] = time24.split(':').map(Number);
  const suffix = hour >= 12 ? 'PM' : 'AM';
  const hour12 = ((hour + 11) % 12) + 1;
  return `${hour12}:${minute.toString().padStart(2,'0')} ${suffix}`;
}

// Apply appearance mode
function applyAppearance(mode) {
  document.body.classList.remove('light-mode','dark-mode','device-mode');
  if(mode === 'light') document.body.classList.add('light-mode');
  else if(mode === 'dark') document.body.classList.add('dark-mode');
  // Device mode follows system
}

// Apply all settings
function applySettings() {
  // Appearance mode
  applyAppearance(settings.appearanceMode);
  appearanceButtons.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.value === settings.appearanceMode);
  });

  // Accent color
  document.documentElement.style.setProperty('--accent-color', settings.accentColor);
  accentPicker.value = settings.accentColor;
  accentPreview.style.backgroundColor = settings.accentColor;

  // Text size
  document.documentElement.style.setProperty('--font-size-base', settings.textSize + 'px');
  textSizeSlider.value = settings.textSize;
  textSizeBadge.textContent = `${settings.textSize}px`;
  updateSliderFill(textSizeSlider);

  // Focus outline
  if(settings.focusOutline) document.body.classList.remove('focus-outline-disabled');
  else document.body.classList.add('focus-outline-disabled');
  focusOutlineToggle.checked = settings.focusOutline;

  // High contrast
  highContrastToggle.checked = settings.highContrast;
  if(settings.highContrast) document.body.classList.add('high-contrast');
  else document.body.classList.remove('high-contrast');

  // Dyslexia font
  dyslexiaFontToggle.checked = settings.dyslexiaFont;
  if(settings.dyslexiaFont) document.body.classList.add('dyslexia-font');
  else document.body.classList.remove('dyslexia-font');

  // Underline links
  underlineLinksToggle.checked = settings.underlineLinks;
  if(settings.underlineLinks) document.body.classList.add('underline-links');
  else document.body.classList.remove('underline-links');

  // Mouse trail
  mouseTrailToggle.checked = settings.mouseTrail;
  toggleMouseTrail(settings.mouseTrail);

  // Dark mode scheduler
  darkModeScheduler.value = settings.darkModeScheduler;
  customTimeInputs.style.display = settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
  darkModeStartInput.value = settings.darkModeStart;
  darkModeEndInput.value = settings.darkModeEnd;
  darkModeStartDisplay.textContent = formatTime12h(settings.darkModeStart);
  darkModeEndDisplay.textContent = formatTime12h(settings.darkModeEnd);
}

// Update slider background fill
function updateSliderFill(slider) {
  const percentage = ((slider.value - slider.min) / (slider.max - slider.min)) * 100;
  slider.style.background = `linear-gradient(90deg, var(--accent-color) 0%, var(--accent-color) ${percentage}%, var(--slider-track-color) ${percentage}%, var(--slider-track-color) 100%)`;
}

// Toggle mouse trail
function toggleMouseTrail(enabled) {
  const trail = document.getElementById('mouse-trail');
  if(enabled) trail.style.display = 'block';
  else trail.style.display = 'none';
}

// ==========================
// Event Listeners
// ==========================

// Appearance buttons
appearanceButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    settings.appearanceMode = btn.dataset.value;
    applySettings();
    saveSettings(settings);
  });
});

// Accent color picker
accentPicker.addEventListener('input', () => {
  settings.accentColor = accentPicker.value;
  applySettings();
  saveSettings(settings);
});

// Text size slider
textSizeSlider.addEventListener('input', () => {
  settings.textSize = parseInt(textSizeSlider.value);
  applySettings();
  saveSettings(settings);
});

// Focus outline toggle
focusOutlineToggle.addEventListener('change', () => {
  settings.focusOutline = focusOutlineToggle.checked;
  applySettings();
  saveSettings(settings);
});

// High contrast toggle
highContrastToggle.addEventListener('change', () => {
  settings.highContrast = highContrastToggle.checked;
  applySettings();
  saveSettings(settings);
});

// Dyslexia font toggle
dyslexiaFontToggle.addEventListener('change', () => {
  settings.dyslexiaFont = dyslexiaFontToggle.checked;
  applySettings();
  saveSettings(settings);
});

// Underline links toggle
underlineLinksToggle.addEventListener('change', () => {
  settings.underlineLinks = underlineLinksToggle.checked;
  applySettings();
  saveSettings(settings);
});

// Mouse trail toggle
mouseTrailToggle.addEventListener('change', () => {
  settings.mouseTrail = mouseTrailToggle.checked;
  toggleMouseTrail(settings.mouseTrail);
  saveSettings(settings);
});

// Dark mode scheduler
darkModeScheduler.addEventListener('change', () => {
  settings.darkModeScheduler = darkModeScheduler.value;
  customTimeInputs.style.display = settings.darkModeScheduler === 'custom' ? 'flex' : 'none';
  saveSettings(settings);
});

// Custom start time
darkModeStartInput.addEventListener('input', () => {
  settings.darkModeStart = darkModeStartInput.value;
  darkModeStartDisplay.textContent = formatTime12h(settings.darkModeStart);
  saveSettings(settings);
});

// Custom end time
darkModeEndInput.addEventListener('input', () => {
  settings.darkModeEnd = darkModeEndInput.value;
  darkModeEndDisplay.textContent = formatTime12h(settings.darkModeEnd);
  saveSettings(settings);
});

// Reset to defaults
resetButton.addEventListener('click', () => {
  if(confirm('Are you sure you want to reset all settings to factory defaults?')) {
    Object.assign(settings, defaultSettings);
    applySettings();
    saveSettings(settings);
  }
});

// Mouse trail animation
document.addEventListener('mousemove', e => {
  if(!settings.mouseTrail) return;
  const trail = document.createElement('div');
  trail.className = 'trail';
  trail.style.left = `${e.clientX}px`;
  trail.style.top = `${e.clientY}px`;
  document.getElementById('mouse-trail').appendChild(trail);
  setTimeout(() => trail.remove(), 800);
});

// ==========================
// Initialize page
// ==========================
applySettings();

// Update footer year
document.getElementById('year').textContent = new Date().getFullYear();
