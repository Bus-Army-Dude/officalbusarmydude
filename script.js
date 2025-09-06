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

    const scrollToTopBtn = document.querySelector(".scroll-to-top");
    const progressIndicator = document.querySelector(".progress-indicator");

    // Ensure elements exist before adding listeners
    if (!scrollToTopBtn || !progressIndicator) {
        return;
    }

    // --- 1. Show/Hide Button on Scroll ---
    const showButtonOnScroll = () => {
        if (window.scrollY > 200) { // Show button after scrolling 200px down
            scrollToTopBtn.classList.add("visible");
        } else {
            scrollToTopBtn.classList.remove("visible");
        }
    };

    // --- 2. Update Progress Ring on Scroll ---
    const updateProgressRing = () => {
        const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = (window.scrollY / totalScrollHeight) * 100;
        
        // Get circumference of the circle (2 * PI * radius)
        // From CSS, r = 25 (for 55px viewbox), so circumference = 2 * Math.PI * 25 ≈ 157.08
        const circumference = progressIndicator.r.baseVal.value * 2 * Math.PI;

        // Calculate dash offset: (100 - percentage) / 100 * circumference
        const offset = circumference - (scrollPercentage / 100) * circumference;
        progressIndicator.style.strokeDashoffset = offset;
    };

    // --- 3. Click Action to Scroll Top ---
    const scrollToTop = () => {
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };

    // --- Attach Event Listeners ---
    window.addEventListener("scroll", () => {
        showButtonOnScroll();
        updateProgressRing();
    });
    scrollToTopBtn.addEventListener("click", scrollToTop);

    // Initial calculation in case page loads already scrolled down
    showButtonOnScroll();
    updateProgressRing();
});

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
