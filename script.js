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

// ========================
// Scroll to Top Orb Logic
// ========================

const scrollBtn = document.querySelector('.scroll-to-top');
const arrow = scrollBtn.querySelector('.arrow');
const progressIndicator = scrollBtn.querySelector('.progress-indicator');

let lastScrollY = window.scrollY;

// Update orb visibility and arrow direction
function updateScrollOrb() {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollFraction = window.scrollY / scrollHeight;

    // Show orb after scrolling down a bit
    if (window.scrollY > 100) {
        scrollBtn.classList.add('visible');
    } else {
        scrollBtn.classList.remove('visible');
    }

    // Arrow rotation based on scroll direction
    if (window.scrollY > lastScrollY) {
        arrow.classList.remove('up');
        arrow.classList.add('down');
    } else {
        arrow.classList.remove('down');
        arrow.classList.add('up');
    }
    lastScrollY = window.scrollY;

    // Update progress ring
    const circumference = parseFloat(progressIndicator.getAttribute('stroke-dasharray'));
    const offset = circumference * (1 - scrollFraction);
    progressIndicator.style.strokeDashoffset = offset;
}

// Scroll to top with spin animation
function scrollToTop() {
    arrow.classList.add('spin-animation');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => arrow.classList.remove('spin-animation'), 500); // reset spin
}

window.addEventListener('scroll', updateScrollOrb);
scrollBtn.addEventListener('click', scrollToTop);

// Initial call to set position on page load
updateScrollOrb();

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
