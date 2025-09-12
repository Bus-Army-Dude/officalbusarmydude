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

    // Enhanced Interaction Control (Copy Protection, Drag Prevention, Context Menu)
    const enhancedInteractionControl = {
        init() {
            // Prevent context menu (right-click/long-press menu)
            document.addEventListener('contextmenu', e => e.preventDefault());

            // Prevent text selection globally, but allow in inputs/textareas
            document.addEventListener('selectstart', e => {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
                    e.preventDefault();
                }
            });

            // Prevent copying globally, but allow from inputs/textareas
            document.addEventListener('copy', e => {
                const target = e.target;
                if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA' && !target.isContentEditable) {
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

 // --- Live Date & Time Update ---
function updateTime() {
    const now = new Date();
    const locale = navigator.language || 'en-US';

    const datePart = now.toLocaleDateString(locale, {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
    });
    const timePart = now.toLocaleTimeString(locale, {
        hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true, timeZoneName: 'short'
    });
    const formattedDateTime = `${datePart} at ${timePart}`;

    // Update main date/time section
    const dateTimeSectionElement = document.querySelector('.datetime-section .current-datetime');
    if (dateTimeSectionElement) {
        dateTimeSectionElement.textContent = formattedDateTime;
    }

    // Update version info section time
    // FIX: Target the inner '.version-value' span to avoid deleting the label
    const versionTimeElement = document.querySelector('.version-info-section .update-time .version-value');
    if (versionTimeElement) {
        versionTimeElement.textContent = formattedDateTime;
    }
}

// Ensure this part is placed inside your main DOMContentLoaded event listener, or called after it.
updateTime();
setInterval(updateTime, 1000);

document.addEventListener('DOMContentLoaded', function() {
    // Selectors for the scroll-to-top button elements
    const scrollToTopBtn = document.querySelector("#scrollTopBtn");
    const progressIndicator = document.querySelector(".progress-indicator");
    const arrow = document.querySelector(".scroll-to-top .arrow");

    // Exit if the button and its parts aren't found on the page
    if (!scrollToTopBtn || !progressIndicator || !arrow) {
        return;
    }

    let lastScroll = window.scrollY;
    
    // --- Correct Circumference Calculation for a CIRCLE ---
    const radius = progressIndicator.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    // Set the initial dash array and offset in JS to ensure it matches the calculation
    progressIndicator.style.strokeDasharray = `${circumference} ${circumference}`;
    progressIndicator.style.strokeDashoffset = circumference;


    // --- Core Functions ---
    const showButtonOnScroll = () => {
        if (window.scrollY > 200) {
            scrollToTopBtn.classList.add("visible");
        } else {
            scrollToTopBtn.classList.remove("visible");
        }
    };

    const updateProgressRing = () => {
        const totalScrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercentage = totalScrollHeight > 0 ? (window.scrollY / totalScrollHeight) : 0;
        const offset = circumference - scrollPercentage * circumference;
        progressIndicator.style.strokeDashoffset = offset;
    };

    const updateArrowDirection = () => {
        if (window.scrollY > lastScroll) {
            arrow.textContent = "↓"; // Scrolling down
        } else {
            arrow.textContent = "↑"; // Scrolling up
        }
        lastScroll = window.scrollY;
    };

    const scrollToTop = () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
        arrow.textContent = "↑";
    };

    // --- Main Handler that checks the setting ---
    const handleScrollAndSettings = () => {
        // FIRST, check if the setting is disabled.
        if (document.body.classList.contains('scroll-to-top-disabled')) {
            // If it is disabled, make sure the button is hidden and stop.
            scrollToTopBtn.classList.remove("visible");
            return;
        }

        // If the setting is NOT disabled, run all the normal functions.
        showButtonOnScroll();
        updateProgressRing();
        updateArrowDirection();
    };


    // --- Event Listeners ---
    window.addEventListener("scroll", handleScrollAndSettings);
    scrollToTopBtn.addEventListener("click", scrollToTop);

    // Initial check when the page loads
    handleScrollAndSettings();

    // Create an observer to watch for class changes on the body element.
    // This makes the toggle on the settings page work instantly.
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                // Re-run the handler to immediately show or hide the button
                handleScrollAndSettings();
            }
        });
    });

    observer.observe(document.body, { attributes: true });
});

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
    function updateFooterYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    updateFooterYear();

}); // --- END OF DOMContentLoaded ---
