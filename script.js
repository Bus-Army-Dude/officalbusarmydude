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

const scrollToTopBtn = document.querySelector("#scrollToTopBtn");
const progressIndicator = document.querySelector(".progress-indicator");
const arrow = document.querySelector(".scroll-to-top .arrow");

let lastScroll = window.scrollY;

if (scrollToTopBtn && progressIndicator && arrow) {
    // Get radius dynamically from the SVG circle
    const radius = progressIndicator.r.baseVal.value;
    const circumference = 2 * Math.PI * radius;

    // Apply circumference dynamically
    progressIndicator.style.strokeDasharray = `${circumference}`;
    progressIndicator.style.strokeDashoffset = `${circumference}`;

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

        // Adjust stroke offset based on scroll
        const offset = circumference - scrollPercentage * circumference;
        progressIndicator.style.strokeDashoffset = offset;

        // Neon glow intensity scales with scroll
        const glowIntensity = Math.min(1, scrollPercentage);
        progressIndicator.style.filter = `
            drop-shadow(0 0 ${6 + 6 * glowIntensity}px var(--accent-color))
            drop-shadow(0 0 ${12 + 12 * glowIntensity}px var(--accent-color))
        `;
    };

    const updateArrowDirection = () => {
        if (document.body.classList.contains("no-motion")) {
            arrow.classList.remove("down");
            arrow.classList.add("up"); // locked up in no-motion mode
            return;
        }

        if (window.scrollY > lastScroll + 5) {
            arrow.classList.remove("up");
            arrow.classList.add("down");
        } else if (window.scrollY < lastScroll - 5) {
            arrow.classList.remove("down");
            arrow.classList.add("up");
        }
        lastScroll = window.scrollY;
    };

    const scrollToTop = () => {
        arrow.classList.remove("down");
        arrow.classList.add("up");
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    window.addEventListener("scroll", () => {
        showButtonOnScroll();
        updateProgressRing();
        updateArrowDirection();
    });

    scrollToTopBtn.addEventListener("click", scrollToTop);

    // Initialize on load
    showButtonOnScroll();
    updateProgressRing();
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
    function updateFooterYear() {
        const yearElement = document.getElementById('year');
        if (yearElement) {
            yearElement.textContent = new Date().getFullYear();
        }
    }
    updateFooterYear();

}); // --- END OF DOMContentLoaded ---
