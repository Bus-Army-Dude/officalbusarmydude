document.addEventListener('DOMContentLoaded', () => {
    // Enhanced Interaction Control (Copy Protection, Drag Prevention, Context Menu)
    const enhancedInteractionControl = {
        init() {
            // Prevent context menu (right-click/long-press menu)
            document.addEventListener('contextmenu', e => e.preventDefault());

            // Prevent text selection globally, but allow in inputs/textareas
            document.addEventListener('selectstart', e => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                    e.preventDefault();
                }
            });

            // Prevent copying globally, but allow from inputs/textareas
            document.addEventListener('copy', e => {
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA' && !e.target.isContentEditable) {
                    e.preventDefault();
                }
            });

            // Prevent dragging of links and buttons
            document.addEventListener('dragstart', e => {
                if (e.target.closest('a, .social-button, .link-button, .settings-button, .merch-button, .weather-button, .disabilities-section a, .visit-profile')) {
                    e.preventDefault();
                }
            });

            // Attempt to suppress long-press actions on specific links/buttons (mainly for mobile)
            const interactiveElements = document.querySelectorAll(
                'a, .social-button, .link-button, .settings-button, .merch-button, .weather-button, .disabilities-section a, .visit-profile'
            );
            interactiveElements.forEach(element => {
                element.setAttribute('draggable', 'false');
            });
        }
    };

    enhancedInteractionControl.init();

    function updateTime() {
    const now = new Date();

    // Locale-aware and automatically gets user's timezone abbreviation (e.g. EDT, PDT, etc.)
    const locale = navigator.language || 'en-US';

    // Date part: Monday, June 18, 2025
    const datePart = now.toLocaleDateString(locale, {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    // Time part: 11:22:33 AM EDT
    const timePart = now.toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
        timeZoneName: 'short'
    });

    const formattedDateTime = `${datePart} at ${timePart}`;

    // Update .current-datetime
    const dateTimeSectionElement = document.querySelector('.datetime-section .current-datetime');
    if (dateTimeSectionElement) {
        dateTimeSectionElement.textContent = formattedDateTime;
    }

    // Optional: update .update-time in version info as well
    const versionTimeElement = document.querySelector('.version-info-section .update-time');
    if (versionTimeElement) {
        versionTimeElement.textContent = formattedDateTime;
    }
}

updateTime();
setInterval(updateTime, 1000);

    // --- Back to top button ---
    const scrollBtn = document.getElementById('scrollToTop');
    const indicator = document.querySelector('.scroll-to-top .progress-indicator');

    function updateScrollIndicator() {
        if (!indicator || !scrollBtn) return;

        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = docHeight > 0 ? Math.min(scrollTop / docHeight, 1) : 0;

        const radius = indicator.r ? indicator.r.baseVal.value : 0;
        if (radius > 0) {
            const circumference = 2 * Math.PI * radius;
            indicator.style.strokeDasharray = circumference;
            const offset = circumference * (1 - progress);
            indicator.style.strokeDashoffset = offset;
        }

        if (scrollTop > 100) {
            scrollBtn.classList.add('visible');
        } else {
            scrollBtn.classList.remove('visible');
        }
    }

    if (scrollBtn && indicator) {
        const radius = indicator.r ? indicator.r.baseVal.value : 0;
        if (radius > 0) {
            const circumference = 2 * Math.PI * radius;
            indicator.style.strokeDasharray = circumference;
            indicator.style.strokeDashoffset = circumference;
        }
        updateScrollIndicator();
        window.addEventListener('scroll', updateScrollIndicator, { passive: true });

        scrollBtn.addEventListener('click', e => {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // --- Cookie Consent ---
    const cookieConsent = document.getElementById('cookieConsent');
    const acceptCookiesBtn = document.getElementById('cookieAccept'); // Corrected ID assuming it should be 'cookieAccept'

    if (cookieConsent && acceptCookiesBtn) {
        if (!localStorage.getItem('cookieAccepted')) {
            cookieConsent.style.display = 'block';
        }
        acceptCookiesBtn.addEventListener('click', () => {
            localStorage.setItem('cookieAccepted', 'true');
            cookieConsent.style.display = 'none';
        });
    }

    // Update footer year dynamically
    function updateFooterYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    updateFooterYear();

}); // --- END OF DOMContentLoaded ---

// --- HTTPS Redirect ---
if (window.location.protocol !== "https:" && window.location.hostname !== "localhost" && !window.location.hostname.startsWith("127.")) {
    console.log("Redirecting to HTTPS...");
    window.location.href = "https://" + window.location.host + window.location.pathname + window.location.search;
}

// --- Page Load Animation ---
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});
