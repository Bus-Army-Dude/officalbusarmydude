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

const scrollToTopBtn = document.querySelector("#scrollTopBtn");
const arrow = document.querySelector(".scroll-to-top .arrow");
const progressCircle = document.querySelector(".progress-indicator");

if (scrollToTopBtn && arrow && progressCircle) {
  const radius = progressCircle.r.baseVal.value;
  const circumference = 2 * Math.PI * radius;
  progressCircle.style.strokeDasharray = circumference;
  progressCircle.style.strokeDashoffset = circumference;

  let lastScroll = 0;

  const updateProgress = () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const scrollY = window.scrollY;
    const progress = totalHeight > 0 ? (scrollY / totalHeight) * circumference : 0;
    progressCircle.style.strokeDashoffset = circumference - progress;

    if (scrollY > 200) {
      scrollToTopBtn.classList.add("visible");
    } else {
      scrollToTopBtn.classList.remove("visible");
    }

    // Neon glow intensity scales with scroll progress
    const glowIntensity = Math.min(1, scrollY / totalHeight);
    progressCircle.style.filter = `
      drop-shadow(0 0 ${6 + 6 * glowIntensity}px var(--accent-color))
      drop-shadow(0 0 ${12 + 12 * glowIntensity}px var(--accent-color))
    `;

    // Smooth arrow rotation
    if (scrollY > lastScroll + 5) {
      arrow.classList.remove("up");
      arrow.classList.add("down");
    } else if (scrollY < lastScroll - 5) {
      arrow.classList.remove("down");
      arrow.classList.add("up");
    }

    lastScroll = scrollY;
  };

  const scrollToTop = () => {
    arrow.classList.remove("down");
    arrow.classList.add("up"); // rotate up when clicked
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  window.addEventListener("scroll", updateProgress);
  scrollToTopBtn.addEventListener("click", scrollToTop);
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
