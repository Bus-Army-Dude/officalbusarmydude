// --- HTTPS Redirect ---
// Run this check immediately, before waiting for DOM content.
if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && !window.location.hostname.startsWith("127.")) {
    console.log("Redirecting to HTTPS...");
    window.location.href = "https://" + window.location.host + window.location.pathname + window.location.search;
}

// --- Page Load Animation ---
// 'load' fires after all resources (images, css) are loaded, which is appropriate for fade-in effects.
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// --- Main script execution after HTML is parsed ---
document.addEventListener('DOMContentLoaded', () => {

    // =================================================================
    // --- Live Settings Application (for Instant Updates) ---
    // =================================================================
    const applyAllHomepageSettings = () => {
        const settings = JSON.parse(localStorage.getItem('websiteSettings')) || {};
        
        // Define defaults here to prevent errors if settings haven't been saved yet
        const defaults = {
            motionEffects: 'standard',
            mouseTrail: 'disabled',
            fontSize: 17,
            focusOutline: 'enabled',
            highContrast: 'disabled',
            dyslexiaFont: 'disabled',
            underlineLinks: 'disabled',
            showSocialLinks: 'enabled',
            showPresidentSection: 'enabled',
            showTiktokShoutouts: 'enabled',
            showInstagramShoutouts: 'enabled',
            showYoutubeShoutouts: 'enabled',
            showUsefulLinks: 'enabled',
            showCountdown: 'enabled',
            showBusinessSection: 'enabled',
            showTechInformation: 'enabled',
            showDisabilitiesSection: 'enabled'
        };
        const currentSettings = { ...defaults, ...settings };

        // 1. Apply Animations
        document.body.classList.remove('reduce-motion', 'subtle-motion');
        if (currentSettings.motionEffects === 'subtle') {
            document.body.classList.add('subtle-motion');
        } else if (currentSettings.motionEffects === 'off') {
            document.body.classList.add('reduce-motion');
        }

        // 2. Apply Mouse Trail
        document.body.classList.toggle('mouse-trail-enabled', currentSettings.mouseTrail === 'enabled');

        // 3. Apply Font Size
        document.documentElement.style.setProperty('--font-size-base', `${currentSettings.fontSize}px`);
        
        // 4. Apply Accessibility Toggles
        document.body.classList.toggle('focus-outline-disabled', currentSettings.focusOutline === 'disabled');
        document.body.classList.toggle('high-contrast', currentSettings.highContrast === 'enabled');
        document.body.classList.toggle('dyslexia-font', currentSettings.dyslexiaFont === 'enabled');
        document.body.classList.toggle('underline-links', currentSettings.underlineLinks === 'enabled');

        // 5. Apply Section Visibility
        const setVisibility = (settingKey, elementId) => {
            const section = document.getElementById(elementId);
            if (section) {
                section.style.display = currentSettings[settingKey] === 'enabled' ? '' : 'none';
            }
        };
        
        Object.keys(defaults)
            .filter(k => k.startsWith('show'))
            .forEach(key => {
                const id = key.replace('show', '').charAt(0).toLowerCase() + key.slice(5) + '-section';
                // Convert camelCase (like 'tiktokShoutouts-section') to kebab-case ('tiktok-shoutouts-section')
                const finalId = id.replace(/([A-Z])/g, "-$1").toLowerCase();
                setVisibility(key, finalId);
            });
    };

    // --- APPLY SETTINGS ON INITIAL LOAD ---
    applyAllHomepageSettings();

    // --- LISTEN FOR SETTINGS CHANGES FROM OTHER TABS ---
    window.addEventListener('storage', (e) => {
        if (e.key === 'websiteSettings') {
            console.log("Settings changed in another tab. Applying live updates...");
            applyAllHomepageSettings();
        }
    });


    // --- Enhanced Interaction Control (Copy Protection, Drag Prevention, Context Menu) ---
    const enhancedInteractionControl = {
        init() {
            document.addEventListener('contextmenu', e => e.preventDefault());
            document.addEventListener('selectstart', e => {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
                    e.preventDefault();
                }
            });
            document.addEventListener('copy', e => {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
                    e.preventDefault();
                }
            });
            document.addEventListener('dragstart', e => {
                if (e.target.closest('a, .social-button, .link-button, .settings-button, .merch-button, .weather-button, .disabilities-section a, .visit-profile')) {
                    e.preventDefault();
                }
            });
            const interactiveElements = document.querySelectorAll(
                'a, .social-button, .link-button, .settings-button, .merch-button, .weather-button, .disabilities-section a, .visit-profile'
            );
            interactiveElements.forEach(element => {
                element.setAttribute('draggable', 'false');
            });
        }
    };
    enhancedInteractionControl.init();

    // --- Live Date & Time Update ---
    function updateTime() {
        const now = new Date();
        const locale = navigator.language || 'en-US';
        const datePart = now.toLocaleDateString(locale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        const timePart = now.toLocaleTimeString(locale, { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short' });
        const formattedDateTime = `${datePart} at ${timePart}`;
        const dateTimeSectionElement = document.querySelector('.datetime-section .current-datetime');
        if (dateTimeSectionElement) {
            dateTimeSectionElement.textContent = formattedDateTime;
        }
        const versionTimeElement = document.querySelector('.version-info-section .update-time .version-value');
        if (versionTimeElement) {
            versionTimeElement.textContent = formattedDateTime;
        }
    }
    updateTime();
    setInterval(updateTime, 1000);

    // --- Scroll to Top Orb Logic ---
    const scrollBtn = document.querySelector('.scroll-to-top');
    if (scrollBtn) {
        const arrow = scrollBtn.querySelector('.arrow');
        const progressCircle = scrollBtn.querySelector('.progress-indicator');
        const radius = progressCircle.r.baseVal.value;
        const circumference = 2 * Math.PI * radius;
        progressCircle.style.strokeDasharray = `${circumference}`;
        progressCircle.style.strokeDashoffset = `${circumference}`;
        let lastScrollY = window.scrollY;

        function updateProgress() {
            const scrollTop = window.scrollY;
            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
            const progress = scrollHeight ? (scrollTop / scrollHeight) : 0;
            progressCircle.style.strokeDashoffset = `${circumference * (1 - progress)}`;
            if (scrollTop > lastScrollY) {
                arrow.classList.remove('up');
                arrow.classList.add('down');
            } else if (scrollTop < lastScrollY) {
                arrow.classList.remove('down');
                arrow.classList.add('up');
            }
            lastScrollY = scrollTop;
            if (scrollTop > 100) {
                scrollBtn.classList.add('visible');
            } else {
                scrollBtn.classList.remove('visible');
            }
        }
        window.addEventListener('scroll', updateProgress);
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            arrow.classList.remove('down');
            arrow.classList.add('up');
        });
    }

    // --- Cookie Consent ---
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('cookieAccept');
    if (cookieConsent && acceptCookiesBtn) {
        if (!localStorage.getItem('cookieAccepted')) {
            cookieConsent.style.display = 'block';
        }
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieAccepted', 'true');
            cookieConsent.style.display = 'none';
        });
    }

    // --- Update footer year dynamically ---
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
});
