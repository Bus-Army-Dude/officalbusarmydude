// admin.js (Consolidated and Cleaned Version)

// *** Import Firebase services from your corrected init file ***
import { db, auth } from './firebase-init.js'; // Ensure path is correct

// Import Firebase functions
import {
    getFirestore, collection, addDoc, getDocs, doc, deleteDoc, updateDoc, setDoc, serverTimestamp, getDoc, query, orderBy, where, limit, Timestamp, deleteField
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-firestore.js";
import {
    getAuth,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    GoogleAuthProvider,
    signInWithCredential
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

// *** Global Variables for Client-Side Filtering ***
let allShoutouts = { tiktok: [], instagram: [], youtube: [] };
let allUsefulLinks = [];
let allSocialLinks = [];
let allDisabilities = [];
let allTechItems = [];
let allActivityLogEntries = []; // For Activity Log feature

document.addEventListener('DOMContentLoaded', () => {

    // ========================================================================
    // --- Firestore References ---
    // ========================================================================
    const profileDocRef = doc(db, "site_config", "mainProfile");
    const presidentDocRef = doc(db, "site_config", "currentPresident");
    const businessDocRef = doc(db, "site_config", "businessDetails");
    const shoutoutsMetaRef = doc(db, 'siteConfig', 'shoutoutsMetadata');
    const usefulLinksCollectionRef = collection(db, "useful_links");
    const socialLinksCollectionRef = collection(db, "social_links");
    const disabilitiesCollectionRef = collection(db, "disabilities");
    const techItemsCollectionRef = collection(db, "tech_items");

    // ========================================================================
    // --- DOM Element References ---
    // ========================================================================

    // --- Login & General Admin ---
    const loginSection = document.getElementById('login-section');
    const adminContent = document.getElementById('admin-content');
    const loginForm = document.getElementById('login-form');
    const logoutButton = document.getElementById('logout-button');
    const authStatus = document.getElementById('auth-status');
    const adminGreeting = document.getElementById('admin-greeting');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');
    const adminStatusElement = document.getElementById('admin-status');
    const nextButton = document.getElementById('next-button');
    const emailGroup = document.getElementById('email-group');
    const passwordGroup = document.getElementById('password-group');
    const loginButton = document.getElementById('login-button');
    const timerDisplayElement = document.getElementById('inactivity-timer-display');

    // --- Site Settings & Profile ---
    const profileForm = document.getElementById('profile-form');
    const profileUsernameInput = document.getElementById('profile-username');
    const profilePicUrlInput = document.getElementById('profile-pic-url');
    const profileBioInput = document.getElementById('profile-bio');
    const profileStatusInput = document.getElementById('profile-status');
    const profileStatusMessage = document.getElementById('profile-status-message');
    const adminPfpPreview = document.getElementById('admin-pfp-preview');
    const maintenanceModeToggle = document.getElementById('maintenance-mode-toggle');
    const hideTikTokSectionToggle = document.getElementById('hide-tiktok-section-toggle');
    const settingsStatusMessage = document.getElementById('settings-status-message');

    // --- Countdown Elements ---
    const countdownTitleInput = document.getElementById('countdown-title-input');
    const countdownDatetimeInput = document.getElementById('countdown-datetime-input');
    const saveCountdownSettingsButton = document.getElementById('save-countdown-settings-button');
    const countdownExpiredMessageInput = document.getElementById('countdown-expired-message-input');

    // --- Business Info Management Elements ---
    const businessInfoForm = document.getElementById('business-info-form');
    const contactEmailInput = document.getElementById('business-contact-email');
    const regularHoursContainer = document.getElementById('regular-hours-container');
    const holidayHoursList = document.getElementById('holiday-hours-list');
    const temporaryHoursList = document.getElementById('temporary-hours-list');
    const addHolidayButton = document.getElementById('add-holiday-button');
    const addTemporaryButton = document.getElementById('add-temporary-button');
    const statusOverrideSelect = document.getElementById('business-status-override');
    const businessInfoStatusMessage = document.getElementById('business-info-status-message');

    // --- President Management Elements ---
    const presidentForm = document.getElementById('president-form');
    const presidentNameInput = document.getElementById('president-name');
    const presidentBornInput = document.getElementById('president-born');
    const presidentHeightInput = document.getElementById('president-height');
    const presidentPartyInput = document.getElementById('president-party');
    const presidentTermInput = document.getElementById('president-term');
    const presidentVpInput = document.getElementById('president-vp');
    const presidentImageUrlInput = document.getElementById('president-image-url');
    const presidentStatusMessage = document.getElementById('president-status-message');
    const presidentPreviewArea = document.getElementById('president-preview');

    // --- Shoutout Elements ---
    const addShoutoutTiktokForm = document.getElementById('add-shoutout-tiktok-form');
    const shoutoutsTiktokListAdmin = document.getElementById('shoutouts-tiktok-list-admin');
    const addShoutoutInstagramForm = document.getElementById('add-shoutout-instagram-form');
    const shoutoutsInstagramListAdmin = document.getElementById('shoutouts-instagram-list-admin');
    const addShoutoutYoutubeForm = document.getElementById('add-shoutout-youtube-form');
    const shoutoutsYoutubeListAdmin = document.getElementById('shoutouts-youtube-list-admin');
    const searchInputTiktok = document.getElementById('search-tiktok');
    const searchInputInstagram = document.getElementById('search-instagram');
    const searchInputYoutube = document.getElementById('search-youtube');

    // Shoutout Edit Modal Elements
    const editModal = document.getElementById('edit-shoutout-modal');
    const editForm = document.getElementById('edit-shoutout-form');
    const cancelEditButton = document.getElementById('cancel-edit-button');
    const editUsernameInput = document.getElementById('edit-username');
    const editNicknameInput = document.getElementById('edit-nickname');
    const editOrderInput = document.getElementById('edit-order');
    const editIsVerifiedInput = document.getElementById('edit-isVerified');
    const editBioInput = document.getElementById('edit-bio');
    const editProfilePicInput = document.getElementById('edit-profilePic');
    const editFollowersInput = document.getElementById('edit-followers');
    const editSubscribersInput = document.getElementById('edit-subscribers');
    const editCoverPhotoInput = document.getElementById('edit-coverPhoto');
    const editPlatformSpecificDiv = document.getElementById('edit-platform-specific');

    // Shoutout Preview Area Elements
    const addTiktokPreview = document.getElementById('add-tiktok-preview');
    const addInstagramPreview = document.getElementById('add-instagram-preview');
    const addYoutubePreview = document.getElementById('add-youtube-preview');
    const editShoutoutPreview = document.getElementById('edit-shoutout-preview');

    // --- Tech Management Elements ---
    const addTechItemForm = document.getElementById('add-tech-item-form');
    const techItemsListAdmin = document.getElementById('tech-items-list-admin');
    const techItemsCount = document.getElementById('tech-items-count');
    const searchTechItemsInput = document.getElementById('search-tech-items');
    const editTechItemModal = document.getElementById('edit-tech-item-modal');
    const editTechItemForm = document.getElementById('edit-tech-item-form');
    const cancelEditTechButton = document.getElementById('cancel-edit-tech-button');
    const cancelEditTechButtonSecondary = document.getElementById('cancel-edit-tech-button-secondary');
    const editTechStatusMessage = document.getElementById('edit-tech-status-message');
    const addTechItemPreview = document.getElementById('add-tech-item-preview');
    const editTechItemPreview = document.getElementById('edit-tech-item-preview');

    // --- Useful Links Elements ---
    const addUsefulLinkForm = document.getElementById('add-useful-link-form');
    const usefulLinksListAdmin = document.getElementById('useful-links-list-admin');
    const usefulLinksCount = document.getElementById('useful-links-count');
    const searchInputUsefulLinks = document.getElementById('search-useful-links');
    const editUsefulLinkModal = document.getElementById('edit-useful-link-modal');
    const editUsefulLinkForm = document.getElementById('edit-useful-link-form');
    const cancelEditLinkButton = document.getElementById('cancel-edit-link-button');
    const cancelEditLinkButtonSecondary = document.getElementById('cancel-edit-link-button-secondary');
    const editLinkLabelInput = document.getElementById('edit-link-label');
    const editLinkUrlInput = document.getElementById('edit-link-url');
    const editLinkOrderInput = document.getElementById('edit-link-order');
    const editLinkStatusMessage = document.getElementById('edit-link-status-message');

    // --- Social Links Elements ---
    const addSocialLinkForm = document.getElementById('add-social-link-form');
    const socialLinksListAdmin = document.getElementById('social-links-list-admin');
    const socialLinksCount = document.getElementById('social-links-count');
    const searchInputSocialLinks = document.getElementById('search-social-links');
    const editSocialLinkModal = document.getElementById('edit-social-link-modal');
    const editSocialLinkForm = document.getElementById('edit-social-link-form');
    const editSocialLinkLabelInput = document.getElementById('edit-social-link-label');
    const editSocialLinkUrlInput = document.getElementById('edit-social-link-url');
    const editSocialLinkOrderInput = document.getElementById('edit-social-link-order');
    const editSocialLinkIconClassInput = document.getElementById('edit-social-link-icon-class');
    const editSocialLinkStatusMessage = document.getElementById('edit-social-link-status-message');
    const cancelEditSocialLinkButton = document.getElementById('cancel-edit-social-link-button');
    const cancelEditSocialLinkButtonSecondary = document.getElementById('cancel-edit-social-link-button-secondary');

    // --- Disabilities Management Elements ---
    const addDisabilityForm = document.getElementById('add-disability-form');
    const disabilitiesListAdmin = document.getElementById('disabilities-list-admin');
    const searchInputDisabilities = document.getElementById('search-disabilities');
    const disabilitiesCount = document.getElementById('disabilities-count');
    const editDisabilityModal = document.getElementById('edit-disability-modal');
    const editDisabilityForm = document.getElementById('edit-disability-form');
    const cancelEditDisabilityButton = document.getElementById('cancel-edit-disability-button');
    const cancelEditDisabilityButtonSecondary = document.getElementById('cancel-edit-disability-button-secondary');
    const editDisabilityNameInput = document.getElementById('edit-disability-name');
    const editDisabilityUrlInput = document.getElementById('edit-disability-url');
    const editDisabilityOrderInput = document.getElementById('edit-disability-order');
    const editDisabilityIconInput = document.getElementById('edit-disability-icon'); // Icon input for edit form
    const editDisabilityStatusMessage = document.getElementById('edit-disability-status-message');

    // --- Inactivity Logout Variables ---
    let inactivityTimer;
    let expirationTime;
    let displayIntervalId;
    const INACTIVITY_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes
    const activityEvents = ['mousemove', 'mousedown', 'keypress', 'touchstart', 'scroll'];

    let isAddingShoutout = false; // Flag to prevent double submissions

    // ========================================================================
    // --- Helper Functions: Status Messages and Utilities ---
    // ========================================================================

    /**
     * Placeholder function for logging admin actions. Replace with actual implementation if needed.
     * @param {string} actionType - The type of action performed (e.g., 'SHOUTOUT_ADD').
     * @param {object} details - Additional information about the action.
     */
    function logAdminActivity(actionType, details) {
        console.log(`[Admin Activity Log] Action: ${actionType}`, details || {});
        // Example implementation to save to Firestore:
        // try {
        //     const userEmail = auth.currentUser ? auth.currentUser.email : 'unknown';
        //     addDoc(collection(db, 'activity_log'), {
        //         timestamp: serverTimestamp(),
        //         adminEmail: userEmail,
        //         actionType: actionType,
        //         details: details || {}
        //     });
        // } catch (error) {
        //     console.error("Failed to write to activity log:", error);
        // }
    }

    function showAdminStatus(message, isError = false) {
        if (!adminStatusElement) { console.warn("Admin status element not found"); return; }
        adminStatusElement.textContent = message;
        adminStatusElement.className = `status-message ${isError ? 'error' : 'success'}`;
        setTimeout(() => { if (adminStatusElement) { adminStatusElement.textContent = ''; adminStatusElement.className = 'status-message'; } }, 5000);
    }

    function showProfileStatus(message, isError = false) {
        if (!profileStatusMessage) { console.warn("Profile status message element not found"); showAdminStatus(message, isError); return; }
        profileStatusMessage.textContent = message;
        profileStatusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        setTimeout(() => { if (profileStatusMessage) { profileStatusMessage.textContent = ''; profileStatusMessage.className = 'status-message'; } }, 5000);
    }

    function showSettingsStatus(message, isError = false) {
        if (!settingsStatusMessage) { console.warn("Settings status message element not found"); showAdminStatus(message, isError); return; }
        settingsStatusMessage.textContent = message;
        settingsStatusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        setTimeout(() => { if (settingsStatusMessage) { settingsStatusMessage.textContent = ''; settingsStatusMessage.style.display = 'none'; } }, 3000);
        settingsStatusMessage.style.display = 'block';
    }

    function showPresidentStatus(message, isError = false) {
        if (!presidentStatusMessage) { console.warn("President status message element not found"); showAdminStatus(message, isError); return; }
        presidentStatusMessage.textContent = message;
        presidentStatusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        setTimeout(() => { if (presidentStatusMessage) { presidentStatusMessage.textContent = ''; presidentStatusMessage.className = 'status-message'; } }, 5000);
    }

    function showEditLinkStatus(message, isError = false) {
        if (!editLinkStatusMessage) { console.warn("Edit link status message element not found"); return; }
        editLinkStatusMessage.textContent = message;
        editLinkStatusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        setTimeout(() => { if (editLinkStatusMessage) { editLinkStatusMessage.textContent = ''; editLinkStatusMessage.className = 'status-message'; } }, 3000);
    }

    function showEditSocialLinkStatus(message, isError = false) {
        const statusMsg = document.getElementById('edit-social-link-status-message');
        if (!statusMsg) { console.warn("Edit social link status message element not found"); return; }
        statusMsg.textContent = message;
        statusMsg.className = `status-message ${isError ? 'error' : 'success'}`;
        if (!isError) {
             setTimeout(() => { if (statusMsg && statusMsg.textContent === message) { statusMsg.textContent = ''; statusMsg.className = 'status-message'; } }, 3000);
        }
    }

    function showEditDisabilityStatus(message, isError = false) {
        if (!editDisabilityStatusMessage) { console.warn("Edit disability status message element not found"); return; }
        editDisabilityStatusMessage.textContent = message;
        editDisabilityStatusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
        setTimeout(() => { if (editDisabilityStatusMessage) { editDisabilityStatusMessage.textContent = ''; editDisabilityStatusMessage.className = 'status-message'; } }, 3000);
    }

     function showEditTechItemStatus(message, isError = false) {
         if (!editTechStatusMessage) { console.warn("Edit tech status message element not found"); return; }
         editTechStatusMessage.textContent = message;
         editTechStatusMessage.className = `status-message ${isError ? 'error' : 'success'}`;
         if (!isError) setTimeout(() => { if (editTechStatusMessage && editTechStatusMessage.textContent === message) { editTechStatusMessage.textContent = ''; editTechStatusMessage.className = 'status-message'; } }, 3000);
     }

    function addSubmitListenerOnce(formElement, handler) {
      if (!formElement) {
        console.warn("Attempted to add listener to non-existent form:", formElement);
        return;
      }
      const listenerAttachedFlag = '__submitListenerAttached__';
      if (!formElement[listenerAttachedFlag]) {
        formElement.addEventListener('submit', (e) => {
            e.preventDefault();
            handler();
        });
        formElement[listenerAttachedFlag] = true;
      }
    }

    function capitalizeFirstLetter(string) {
        if (!string) return ''; return string.charAt(0).toUpperCase() + string.slice(1);
    }

    // ========================================================================
    // --- Section: Authentication and Inactivity Timer ---
    // ========================================================================

    onAuthStateChanged(auth, user => {
        if (user) {
            const adminEmails = ["ckritzar53@busarmydude.org", "rkritzar53@gmail.com"];
            if (adminEmails.includes(user.email)) {
                console.log(`✅ Access GRANTED for admin: ${user.email}`);
                if (loginSection) loginSection.style.display = 'none';
                if (adminContent) adminContent.style.display = 'block';
                if (logoutButton) logoutButton.style.display = 'inline-block';
                if (adminGreeting) adminGreeting.textContent = `Logged in as: ${user.displayName || user.email}`;

                // Load all data sections
                loadProfileData();
                loadBusinessInfoData();
                setupBusinessInfoListeners();
                loadShoutoutsAdmin('tiktok');
                loadShoutoutsAdmin('instagram');
                loadShoutoutsAdmin('youtube');
                loadUsefulLinksAdmin();
                loadSocialLinksAdmin();
                loadDisabilitiesAdmin();
                loadPresidentData();
                loadTechItemsAdmin();
                // loadActivityLog(); // Uncomment to enable activity log loading

                // Start inactivity timer
                resetInactivityTimer();
                addActivityListeners();
            } else {
                console.warn(`❌ Access DENIED for user: ${user.email}. Not in the admin list.`);
                alert("Access Denied. This account is not authorized to access the admin panel.");
                signOut(auth);
            }
        } else {
            console.log("User is signed out. Displaying login screen.");
            if (loginSection) loginSection.style.display = 'block';
            if (adminContent) adminContent.style.display = 'none';
            removeActivityListeners();
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = emailInput.value;
            const password = passwordInput.value;

            if (!email || !password) {
                if (authStatus) { authStatus.textContent = 'Please enter email and password.'; authStatus.className = 'status-message error'; authStatus.style.display = 'block';}
                return;
            }
            if (authStatus) { authStatus.textContent = 'Logging in...'; authStatus.className = 'status-message'; authStatus.style.display = 'block'; }

            signInWithEmailAndPassword(auth, email, password)
                .catch((error) => {
                    console.error("Login failed:", error.code, error.message);
                    let errorMessage = 'Invalid email or password.';
                    if (error.code === 'auth/invalid-credential') { errorMessage = 'Invalid email or password.'; }
                    else if (error.code === 'auth/too-many-requests') { errorMessage = 'Access temporarily disabled due to too many failed login attempts.'; }
                    if (authStatus) { authStatus.textContent = `Login Failed: ${errorMessage}`; authStatus.className = 'status-message error'; authStatus.style.display = 'block'; }
                });
        });
    }

    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            removeActivityListeners();
            signOut(auth).catch((error) => console.error("Logout failed:", error));
        });
    }

    if (nextButton) {
        nextButton.addEventListener('click', () => {
            const userEmail = emailInput.value.trim();
            if (!userEmail) {
                 authStatus.textContent = 'Please enter your email address.';
                 authStatus.className = 'status-message error'; authStatus.style.display = 'block';
                 return;
            }
            emailGroup.style.display = 'none';
            nextButton.style.display = 'none';
            passwordGroup.style.display = 'block';
            loginButton.style.display = 'inline-block';
            if(passwordInput) passwordInput.focus();
        });
    }

    function updateTimerDisplay() {
        if (!timerDisplayElement) return;
        const remainingMs = expirationTime - Date.now();
        if (remainingMs <= 0) {
            timerDisplayElement.textContent = "00:00";
            clearInterval(displayIntervalId);
        } else {
            const minutes = Math.floor((remainingMs / 1000) / 60);
            const seconds = Math.floor((remainingMs / 1000) % 60);
            timerDisplayElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        }
    }

    function logoutDueToInactivity() {
        console.log("Logging out due to inactivity.");
        signOut(auth).catch((error) => console.error("Error during inactivity logout:", error));
    }

    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        clearInterval(displayIntervalId);
        expirationTime = Date.now() + INACTIVITY_TIMEOUT_MS;
        inactivityTimer = setTimeout(logoutDueToInactivity, INACTIVITY_TIMEOUT_MS);
        updateTimerDisplay(); // Initial display update
        displayIntervalId = setInterval(updateTimerDisplay, 1000);
    }

    function addActivityListeners() {
        activityEvents.forEach(eventName => document.addEventListener(eventName, resetInactivityTimer, true));
    }

    function removeActivityListeners() {
        clearTimeout(inactivityTimer);
        clearInterval(displayIntervalId);
        if (timerDisplayElement) timerDisplayElement.textContent = '';
        activityEvents.forEach(eventName => document.removeEventListener(eventName, resetInactivityTimer, true));
    }

    // ========================================================================
    // --- Section: Profile & Site Settings Management ---
    // ========================================================================

    async function loadProfileData() {
        if (!auth || !auth.currentUser) return;
        if (!profileForm || !maintenanceModeToggle || !hideTikTokSectionToggle || !countdownTitleInput || !countdownDatetimeInput || !countdownExpiredMessageInput || !adminPfpPreview || !profileStatusInput) {
            console.error("One or more profile/settings form elements missing!");
            return;
        }

        try {
            const docSnap = await getDoc(profileDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                // Populate Profile fields
                if(profileUsernameInput) profileUsernameInput.value = data.username || '';
                if(profilePicUrlInput) profilePicUrlInput.value = data.profilePicUrl || '';
                if(profileBioInput) profileBioInput.value = data.bio || '';
                if(profileStatusInput) profileStatusInput.value = data.status || 'offline';

                // Populate Toggles
                maintenanceModeToggle.checked = data.isMaintenanceModeEnabled || false;
                hideTikTokSectionToggle.checked = data.hideTikTokSection || false;

                // Populate Countdown Settings
                if (countdownTitleInput) countdownTitleInput.value = data.countdownTitle || '';
                if (countdownExpiredMessageInput) countdownExpiredMessageInput.value = data.countdownExpiredMessage || '';
                if (countdownDatetimeInput) {
                    if (data.countdownTargetDate && data.countdownTargetDate instanceof Timestamp) {
                        try {
                            const targetDate = data.countdownTargetDate.toDate();
                            const year = targetDate.getFullYear();
                            const month = String(targetDate.getMonth() + 1).padStart(2, '0');
                            const day = String(targetDate.getDate()).padStart(2, '0');
                            const hours = String(targetDate.getHours()).padStart(2, '0');
                            const minutes = String(targetDate.getMinutes()).padStart(2, '0');
                            const seconds = String(targetDate.getSeconds()).padStart(2, '0');
                            countdownDatetimeInput.value = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
                        } catch (dateError) {
                            console.error("Error processing countdown timestamp:", dateError);
                            countdownDatetimeInput.value = '';
                        }
                    } else {
                        countdownDatetimeInput.value = '';
                    }
                }

                // Populate Profile Picture Preview
                if (adminPfpPreview) {
                     if (data.profilePicUrl) {
                        adminPfpPreview.src = data.profilePicUrl;
                        adminPfpPreview.style.display = 'inline-block';
                        adminPfpPreview.onerror = () => { adminPfpPreview.style.display = 'none'; if(profilePicUrlInput) profilePicUrlInput.classList.add('input-error'); };
                     } else {
                        adminPfpPreview.style.display = 'none';
                     }
                }
            } else {
                console.warn(`Profile document ('${profileDocRef.path}') not found.`);
                if (profileForm) profileForm.reset();
                if (profileStatusInput) profileStatusInput.value = 'offline';
            }
        } catch (error) {
            console.error("Error loading profile/settings data:", error);
            showProfileStatus("Error loading profile data.", true);
        } finally {
             maintenanceModeToggle.disabled = false;
             hideTikTokSectionToggle.disabled = false;
             if (countdownTitleInput) countdownTitleInput.disabled = false;
             if (countdownDatetimeInput) countdownDatetimeInput.disabled = false;
             if (countdownExpiredMessageInput) countdownExpiredMessageInput.disabled = false;
        }
    }

    async function saveProfileData(event) {
        event.preventDefault();
        if (!auth || !auth.currentUser || !profileForm) return;

        const newData = {
            username: profileUsernameInput?.value.trim() || "",
            profilePicUrl: profilePicUrlInput?.value.trim() || "",
            bio: profileBioInput?.value.trim() || "",
            status: profileStatusInput?.value || "offline"
        };

        showProfileStatus("Saving profile...");
        try {
            // Use merge: true to avoid overwriting settings fields managed by other functions
            await setDoc(profileDocRef, newData, { merge: true });
            showProfileStatus("Profile updated successfully!", false);
            logAdminActivity('PROFILE_UPDATE', { username: newData.username });
            if (adminPfpPreview && newData.profilePicUrl) {
                adminPfpPreview.src = newData.profilePicUrl;
                adminPfpPreview.style.display = 'inline-block';
            } else if (adminPfpPreview) {
                adminPfpPreview.style.display = 'none';
            }
        } catch (error) {
            console.error("Error saving profile data:", error);
            showProfileStatus(`Error saving profile: ${error.message}`, true);
        }
    }

    async function saveHideTikTokSectionStatus(isEnabled) {
        if (!auth || !auth.currentUser) { showSettingsStatus("Error: Not logged in.", true); if(hideTikTokSectionToggle) hideTikTokSectionToggle.checked = !isEnabled; return; }
        showSettingsStatus("Saving setting...", false);
        try {
            await setDoc(profileDocRef, { hideTikTokSection: isEnabled }, { merge: true });
            showSettingsStatus(`TikTok homepage section set to ${isEnabled ? 'hidden' : 'visible'}.`, false);
        } catch (error) {
            showSettingsStatus(`Error saving setting: ${error.message}`, true);
            if(hideTikTokSectionToggle) hideTikTokSectionToggle.checked = !isEnabled;
        }
    }

    async function saveMaintenanceModeStatus(isEnabled) {
        if (!auth || !auth.currentUser) { showSettingsStatus("Error: Not logged in.", true); if(maintenanceModeToggle) maintenanceModeToggle.checked = !isEnabled; return; }
        showSettingsStatus("Saving setting...", false);
        try {
            await setDoc(profileDocRef, { isMaintenanceModeEnabled: isEnabled }, { merge: true });
            showSettingsStatus(`Maintenance mode ${isEnabled ? 'enabled' : 'disabled'}.`, false);
        } catch (error) {
            showSettingsStatus(`Error saving setting: ${error.message}`, true);
            if(maintenanceModeToggle) maintenanceModeToggle.checked = !isEnabled;
        }
    }

    if (saveCountdownSettingsButton) {
        saveCountdownSettingsButton.addEventListener('click', async () => {
            const title = countdownTitleInput.value.trim();
            const dateTimeString = countdownDatetimeInput.value.trim();
            const expiredMessage = countdownExpiredMessageInput.value.trim();

            const updateData = {
                countdownTitle: title,
                countdownExpiredMessage: expiredMessage
            };

            if (dateTimeString) {
                if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(dateTimeString.length > 16 ? dateTimeString : dateTimeString + ":00")) {
                     showSettingsStatus('Invalid Date/Time format. Use YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS', true);
                     return;
                }
                try {
                    const fullDateTimeString = dateTimeString.length === 16 ? dateTimeString + ":00" : dateTimeString;
                    const localDate = new Date(fullDateTimeString);
                    updateData.countdownTargetDate = Timestamp.fromDate(localDate);
                } catch (error) {
                    showSettingsStatus(`Error parsing date/time input: ${error.message}`, true);
                    return;
                }
            } else {
                 updateData.countdownTargetDate = deleteField();
            }

            showSettingsStatus("Saving countdown settings...", false);
            try {
                await updateDoc(profileDocRef, updateData);
                showSettingsStatus("Countdown settings saved successfully!", false);
                logAdminActivity('UPDATE_COUNTDOWN_SETTINGS', { title: title, targetSet: !!updateData.countdownTargetDate });
            } catch (error) {
                showSettingsStatus(`Error saving countdown settings: ${error.message}`, true);
            }
        });
    }

    // ========================================================================
    // --- Section: President Info Management ---
    // ========================================================================

    function renderPresidentPreview(data) {
        const name = data.name || 'N/A';
        const born = data.born || 'N/A';
        const height = data.height || 'N/A';
        const party = data.party || 'N/A';
        const term = data.term || 'N/A';
        const vp = data.vp || 'N/A';
        const imageUrl = data.imageUrl || 'images/default-president.jpg';

        return `
            <section class="president-section">
                <div class="president-info">
                    <img src="${imageUrl}" alt="President ${name}" class="president-photo" onerror="this.src='images/default-president.jpg'; this.alt='Photo Missing';">
                    <div class="president-details">
                        <h3 class="president-name">${name}</h3>
                        <p><strong>Born:</strong> ${born}</p>
                        <p><strong>Height:</strong> ${height}</p>
                        <p><strong>Party:</strong> ${party}</p>
                        <p class="presidential-term"><strong>Term:</strong> ${term}</p>
                        <p><strong>VP:</strong> ${vp}</p>
                    </div>
                </div>
            </section>`;
    }

    function updatePresidentPreview() {
        if (!presidentForm || !presidentPreviewArea) return;
        const presidentData = {
            name: presidentNameInput?.value.trim(),
            born: presidentBornInput?.value.trim(),
            height: presidentHeightInput?.value.trim(),
            party: presidentPartyInput?.value.trim(),
            term: presidentTermInput?.value.trim(),
            vp: presidentVpInput?.value.trim(),
            imageUrl: presidentImageUrlInput?.value.trim()
        };
        presidentPreviewArea.innerHTML = renderPresidentPreview(presidentData);
    }

    async function loadPresidentData() {
        if (!auth || !auth.currentUser || !presidentForm) return;
        try {
            const docSnap = await getDoc(presidentDocRef);
            if (docSnap.exists()) {
                const data = docSnap.data();
                if(presidentNameInput) presidentNameInput.value = data.name || '';
                if(presidentBornInput) presidentBornInput.value = data.born || '';
                if(presidentHeightInput) presidentHeightInput.value = data.height || '';
                if(presidentPartyInput) presidentPartyInput.value = data.party || '';
                if(presidentTermInput) presidentTermInput.value = data.term || '';
                if(presidentVpInput) presidentVpInput.value = data.vp || '';
                if(presidentImageUrlInput) presidentImageUrlInput.value = data.imageUrl || '';
            } else {
                if (presidentForm) presidentForm.reset();
            }
            updatePresidentPreview();
        } catch (error) {
            console.error("Error loading president data:", error);
            showPresidentStatus("Error loading president data.", true);
        }
    }

    async function savePresidentData(event) {
        event.preventDefault();
        if (!auth || !auth.currentUser || !presidentForm) return;

        const newDataFromForm = {
            name: presidentNameInput?.value.trim() || null,
            born: presidentBornInput?.value.trim() || null,
            height: presidentHeightInput?.value.trim() || null,
            party: presidentPartyInput?.value.trim() || null,
            term: presidentTermInput?.value.trim() || null,
            vp: presidentVpInput?.value.trim() || null,
            imageUrl: presidentImageUrlInput?.value.trim() || null,
        };

        showPresidentStatus("Saving president info...");
        try {
            await setDoc(presidentDocRef, newDataFromForm, { merge: true });
            showPresidentStatus("President info updated successfully!", false);
            logAdminActivity('UPDATE_PRESIDENT_INFO', { name: newDataFromForm.name });
        } catch (error) {
            console.error("Error saving president data:", error);
            showPresidentStatus(`Error saving president info: ${error.message}`, true);
        }
    }

    // ========================================================================
    // --- Section: Business Info Management ---
    // ========================================================================

    function timeStringToMinutesBI(timeStr) {
        if (!timeStr || typeof timeStr !== 'string' || !timeStr.includes(':')) return null;
        try { const [hours, minutes] = timeStr.split(':').map(Number); return hours * 60 + minutes; }
        catch (e) { return null; }
    }

    function populateRegularHoursForm(hoursData = {}) {
        if (!regularHoursContainer) return;
        regularHoursContainer.innerHTML = '';
        daysOfWeek.forEach(day => {
            const dayData = hoursData[day] || { open: '', close: '', isClosed: true };
            const groupDiv = document.createElement('div');
            groupDiv.className = 'day-hours-group';
            groupDiv.innerHTML = `
                <label for="${day}-isClosed">${capitalizeFirstLetter(day)}</label>
                <div class="time-inputs">
                    <input type="time" id="${day}-open" name="${day}-open" value="${dayData.open || ''}" ${dayData.isClosed ? 'disabled' : ''}>
                    <span> - </span>
                    <input type="time" id="${day}-close" name="${day}-close" value="${dayData.close || ''}" ${dayData.isClosed ? 'disabled' : ''}>
                </div>
                <div class="form-group checkbox-group">
                    <input type="checkbox" id="${day}-isClosed" name="${day}-isClosed" ${dayData.isClosed ? 'checked' : ''} class="regular-hours-input">
                    <label for="${day}-isClosed">Closed all day</label>
                </div>`;
            const isClosedCheckbox = groupDiv.querySelector(`#${day}-isClosed`);
            const openInput = groupDiv.querySelector(`#${day}-open`);
            const closeInput = groupDiv.querySelector(`#${day}-close`);
            addListenerSafe(isClosedCheckbox, 'change', (e) => {
                const isDisabled = e.target.checked;
                openInput.disabled = isDisabled; closeInput.disabled = isDisabled;
                if (isDisabled) { openInput.value = ''; closeInput.value = ''; }
                if (typeof updateAdminPreview === 'function') updateAdminPreview();
            }, `reg_${day}_closed`);
            addListenerSafe(openInput, 'input', updateAdminPreview, `reg_${day}_open`);
            addListenerSafe(closeInput, 'input', updateAdminPreview, `reg_${day}_close`);
            regularHoursContainer.appendChild(groupDiv);
        });
    }

    function renderHolidayEntry(entry = {}, index) {
        const uniqueId = `holiday-${Date.now()}-${index}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'hour-entry holiday-entry';
        entryDiv.setAttribute('data-id', uniqueId);
        entryDiv.innerHTML = `
            <button type="button" class="remove-hour-button" title="Remove Holiday/Specific Date">×</button>
            <div class="form-group"><label for="holiday-date-${uniqueId}">Date:</label><input type="date" id="holiday-date-${uniqueId}" class="holiday-input" value="${entry.date || ''}" required></div>
            <div class="form-group"><label for="holiday-label-${uniqueId}">Label:</label><input type="text" id="holiday-label-${uniqueId}" class="holiday-input" value="${entry.label || ''}" placeholder="e.g., Christmas Day"></div>
            <div class="time-inputs">
                <input type="time" id="holiday-open-${uniqueId}" class="holiday-input" value="${entry.open || ''}" ${entry.isClosed ? 'disabled' : ''}>
                <span> - </span>
                <input type="time" id="holiday-close-${uniqueId}" class="holiday-input" value="${entry.close || ''}" ${entry.isClosed ? 'disabled' : ''}>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="holiday-isClosed-${uniqueId}" class="holiday-input" ${entry.isClosed ? 'checked' : ''}>
                <label for="holiday-isClosed-${uniqueId}">Closed all day</label>
            </div>`;

        addListenerSafe(entryDiv.querySelector('.remove-hour-button'), 'click', () => entryDiv.remove(), `rem_hol_${uniqueId}`);
        const isClosedCheckbox = entryDiv.querySelector(`#holiday-isClosed-${uniqueId}`);
        const openInput = entryDiv.querySelector(`#holiday-open-${uniqueId}`);
        const closeInput = entryDiv.querySelector(`#holiday-close-${uniqueId}`);
        addListenerSafe(isClosedCheckbox, 'change', (e) => {
            const isDisabled = e.target.checked;
            openInput.disabled = isDisabled; closeInput.disabled = isDisabled;
            if(isDisabled) { openInput.value = ''; closeInput.value = ''; }
            if (typeof updateAdminPreview === 'function') updateAdminPreview();
        }, `hol_${uniqueId}_closed`);
        return entryDiv;
    }

    function renderTemporaryEntry(entry = {}, index) {
        const uniqueId = `temp-${Date.now()}-${index}`;
        const entryDiv = document.createElement('div');
        entryDiv.className = 'hour-entry temporary-entry';
        entryDiv.setAttribute('data-id', uniqueId);
        entryDiv.innerHTML = `
            <button type="button" class="remove-hour-button" title="Remove Temporary Period">×</button>
            <div class="form-group"><label for="temp-start-${uniqueId}">Start Date:</label><input type="date" id="temp-start-${uniqueId}" class="temp-input" value="${entry.startDate || ''}" required></div>
            <div class="form-group"><label for="temp-end-${uniqueId}">End Date:</label><input type="date" id="temp-end-${uniqueId}" class="temp-input" value="${entry.endDate || ''}" required></div>
            <div class="form-group"><label for="temp-label-${uniqueId}">Label:</label><input type="text" id="temp-label-${uniqueId}" class="temp-input" value="${entry.label || ''}" placeholder="e.g., Summer Event"></div>
            <div class="time-inputs">
                <input type="time" id="temp-open-${uniqueId}" class="temp-input" value="${entry.open || ''}" ${entry.isClosed ? 'disabled' : ''}>
                <span> - </span>
                <input type="time" id="temp-close-${uniqueId}" class="temp-input" value="${entry.close || ''}" ${entry.isClosed ? 'disabled' : ''}>
            </div>
            <div class="form-group checkbox-group">
                <input type="checkbox" id="temp-isClosed-${uniqueId}" class="temp-input" ${entry.isClosed ? 'checked' : ''}>
                <label for="temp-isClosed-${uniqueId}">Closed all day during this period</label>
            </div>`;

        addListenerSafe(entryDiv.querySelector('.remove-hour-button'), 'click', () => entryDiv.remove(), `rem_tmp_${uniqueId}`);
        const isClosedCheckbox = entryDiv.querySelector(`#temp-isClosed-${uniqueId}`);
        const openInput = entryDiv.querySelector(`#temp-open-${uniqueId}`);
        const closeInput = entryDiv.querySelector(`#temp-close-${uniqueId}`);
        addListenerSafe(isClosedCheckbox, 'change', (e) => {
            const isDisabled = e.target.checked;
            openInput.disabled = isDisabled; closeInput.disabled = isDisabled;
            if(isDisabled) { openInput.value = ''; closeInput.value = ''; }
            if (typeof updateAdminPreview === 'function') updateAdminPreview();
        }, `tmp_${uniqueId}_closed`);
        return entryDiv;
    }

    async function loadBusinessInfoData() {
        if (!businessInfoForm) return;
        try {
            const docSnap = await getDoc(businessDocRef);
            let data = {};
            if (docSnap.exists()) data = docSnap.data();

            if (contactEmailInput) contactEmailInput.value = data.contactEmail || '';
            if (statusOverrideSelect) statusOverrideSelect.value = data.statusOverride || 'auto';

            if (typeof populateRegularHoursForm === 'function') populateRegularHoursForm(data.regularHours);
            if (holidayHoursList && typeof renderHolidayEntry === 'function') {
                 holidayHoursList.innerHTML = '';
                 (data.holidayHours || []).forEach((entry, index) => holidayHoursList.appendChild(renderHolidayEntry(entry, index)));
            }
            if (temporaryHoursList && typeof renderTemporaryEntry === 'function') {
                temporaryHoursList.innerHTML = '';
                 (data.temporaryHours || []).forEach((entry, index) => temporaryHoursList.appendChild(renderTemporaryEntry(entry, index)));
            }
            if (typeof updateAdminPreview === 'function') updateAdminPreview();
        } catch (error) {
            console.error("Error loading business info:", error);
            showBusinessInfoStatus(`Error loading info: ${error.message || error}`, true);
        }
    }

    async function saveBusinessInfoData(event) {
        event.preventDefault();
        if (!auth || !auth.currentUser) { showBusinessInfoStatus("Not logged in.", true); return; }
        showBusinessInfoStatus("Saving...");

        const newData = {
            contactEmail: contactEmailInput?.value.trim() || null,
            statusOverride: statusOverrideSelect?.value || "auto",
            regularHours: {}, holidayHours: [], temporaryHours: [],
            lastUpdated: serverTimestamp()
        };
        let formIsValid = true;

        daysOfWeek.forEach(day => {
            const isClosed = document.getElementById(`${day}-isClosed`)?.checked || false;
            const openTime = document.getElementById(`${day}-open`)?.value || null;
            const closeTime = document.getElementById(`${day}-close`)?.value || null;
            newData.regularHours[day] = { open: isClosed ? null : openTime, close: isClosed ? null : closeTime, isClosed: isClosed };
        });

        document.querySelectorAll('#holiday-hours-list .holiday-entry').forEach(entryDiv => {
            const id = entryDiv.getAttribute('data-id'); if (!id) return;
            const entryData = {
                date: entryDiv.querySelector(`input[type="date"]`)?.value || null,
                label: entryDiv.querySelector(`input[type="text"]`)?.value.trim() || null,
                open: entryDiv.querySelector(`#holiday-open-${id}`)?.value || null,
                close: entryDiv.querySelector(`#holiday-close-${id}`)?.value || null,
                isClosed: entryDiv.querySelector(`input[type="checkbox"]`)?.checked || false,
            };
            if (entryData.isClosed) { entryData.open = null; entryData.close = null; }
            if (entryData.date) newData.holidayHours.push(entryData); else formIsValid = false;
        });

        document.querySelectorAll('#temporary-hours-list .temporary-entry').forEach(entryDiv => {
            const id = entryDiv.getAttribute('data-id'); if (!id) return;
            const entryData = {
                startDate: entryDiv.querySelector(`input[name^="temp-start"]`)?.value || null,
                endDate: entryDiv.querySelector(`input[name^="temp-end"]`)?.value || null,
                label: entryDiv.querySelector(`input[name^="temp-label"]`)?.value.trim() || null,
                open: entryDiv.querySelector(`#temp-open-${id}`)?.value || null,
                close: entryDiv.querySelector(`#temp-close-${id}`)?.value || null,
                isClosed: entryDiv.querySelector(`input[type="checkbox"]`)?.checked || false,
            };
            if (entryData.isClosed) { entryData.open = null; entryData.close = null; }
            if (entryData.startDate && entryData.endDate) {
                if (entryData.endDate < entryData.startDate) { formIsValid = false; showBusinessInfoStatus(`Error: Temp End Date cannot be before Start Date.`, true); }
                else newData.temporaryHours.push(entryData);
            } else formIsValid = false;
        });

        if (!formIsValid) { showBusinessInfoStatus("Save failed. Check required dates and date ranges.", true); return; }

        newData.holidayHours.sort((a, b) => (a.date > b.date ? 1 : -1));
        newData.temporaryHours.sort((a, b) => (a.startDate > b.startDate ? 1 : -1));

        try {
            await setDoc(businessDocRef, newData);
            showBusinessInfoStatus("Business info updated successfully!", false);
        } catch (error) {
            console.error("Error saving business info:", error);
            showBusinessInfoStatus(`Error saving: ${error.message}`, true);
        }
    }

    function updateAdminPreview() {
        const adminPreviewStatus = document.getElementById('admin-preview-status');
        const adminPreviewHours = document.getElementById('admin-preview-hours');
        const adminPreviewContact = document.getElementById('admin-preview-contact');
        if (!adminPreviewStatus || !adminPreviewHours || !adminPreviewContact) return;

        // 1. Read current form values into currentFormData object
        const currentFormData = { contactEmail: contactEmailInput?.value.trim() || null, statusOverride: statusOverrideSelect?.value || "auto", regularHours: {}, holidayHours: [], temporaryHours: [] };
        daysOfWeek.forEach(day => {
            const el = document.getElementById(`${day}-isClosed`); if (!el) return;
            currentFormData.regularHours[day] = {
                open: el.checked ? null : document.getElementById(`${day}-open`)?.value || null,
                close: el.checked ? null : document.getElementById(`${day}-close`)?.value || null,
                isClosed: el.checked
            };
        });
        document.querySelectorAll('#holiday-hours-list .holiday-entry').forEach(entryDiv => {
            const id = entryDiv.getAttribute('data-id'); if (!id) return;
            currentFormData.holidayHours.push({
                date: entryDiv.querySelector(`input[type="date"]`)?.value || null,
                label: entryDiv.querySelector(`input[type="text"]`)?.value.trim() || null,
                open: entryDiv.querySelector(`#holiday-open-${id}`)?.value || null,
                close: entryDiv.querySelector(`#holiday-close-${id}`)?.value || null,
                isClosed: entryDiv.querySelector(`input[type="checkbox"]`)?.checked || false,
            });
        });
        document.querySelectorAll('#temporary-hours-list .temporary-entry').forEach(entryDiv => {
            const id = entryDiv.getAttribute('data-id'); if (!id) return;
            currentFormData.temporaryHours.push({
                startDate: entryDiv.querySelector(`input[name^="temp-start"]`)?.value || null,
                endDate: entryDiv.querySelector(`input[name^="temp-end"]`)?.value || null,
                label: entryDiv.querySelector(`input[name^="temp-label"]`)?.value.trim() || null,
                open: entryDiv.querySelector(`#temp-open-${id}`)?.value || null,
                close: entryDiv.querySelector(`#temp-close-${id}`)?.value || null,
                isClosed: entryDiv.querySelector(`input[type="checkbox"]`)?.checked || false,
            });
        });

        // 2. Calculate Preview Status Logic
        let currentStatus = 'Closed'; let statusReason = 'Default'; const previewNow = new Date();
        const previewDayName = daysOfWeek[(previewNow.getDay() + 6) % 7]; const previewDateStr = previewNow.toLocaleDateString('en-CA'); const previewCurrentMinutes = previewNow.getHours() * 60 + previewNow.getMinutes();
        let ruleApplied = false;

        if (currentFormData.statusOverride !== 'auto') {
            currentStatus = currentFormData.statusOverride === 'open' ? 'Open' : (currentFormData.statusOverride === 'closed' ? 'Closed' : 'Temporarily Unavailable');
            statusReason = 'Manual Override'; ruleApplied = true;
        }

        if (!ruleApplied) {
            const todayHoliday = currentFormData.holidayHours.find(h => h.date === previewDateStr);
            if (todayHoliday) {
                statusReason = `Holiday (${todayHoliday.label || todayHoliday.date})`; ruleApplied = true;
                if (todayHoliday.isClosed || !todayHoliday.open || !todayHoliday.close) { currentStatus = 'Closed'; }
                else { const openMins = timeStringToMinutesBI(todayHoliday.open); const closeMins = timeStringToMinutesBI(todayHoliday.close); currentStatus = (openMins !== null && closeMins !== null && previewCurrentMinutes >= openMins && previewCurrentMinutes < closeMins) ? 'Open' : 'Closed'; }
            }
        }
        if (!ruleApplied) {
            const activeTemporary = currentFormData.temporaryHours.find(t => previewDateStr >= t.startDate && previewDateStr <= t.endDate);
            if (activeTemporary) {
                statusReason = `Temporary Hours (${activeTemporary.label || 'Active'})`; ruleApplied = true;
                if (activeTemporary.isClosed) currentStatus = 'Closed';
                else if (activeTemporary.open && activeTemporary.close) {
                    const openMins = timeStringToMinutesBI(activeTemporary.open); const closeMins = timeStringToMinutesBI(activeTemporary.close);
                    if (openMins !== null && closeMins !== null && previewCurrentMinutes >= openMins && previewCurrentMinutes < closeMins) currentStatus = 'Temporarily Unavailable'; else currentStatus = 'Closed'; // Outside temp specific hours
                } else currentStatus = 'Closed'; // No specific time on temp rule, assume closed for safety or specific logic
            }
        }
        if (!ruleApplied) {
            statusReason = 'Regular Hours'; const todayRegularHours = currentFormData.regularHours[previewDayName];
            if (todayRegularHours && !todayRegularHours.isClosed && todayRegularHours.open && todayRegularHours.close) {
                const openMins = timeStringToMinutesBI(todayRegularHours.open); const closeMins = timeStringToMinutesBI(todayRegularHours.close);
                if (openMins !== null && closeMins !== null && previewCurrentMinutes >= openMins && previewCurrentMinutes < closeMins) currentStatus = 'Open';
            }
        }

        // 3. Display Status
        let statusClass = (currentStatus === 'Open') ? 'status-open' : (currentStatus === 'Temporarily Unavailable' ? 'status-unavailable' : 'status-closed');
        adminPreviewStatus.innerHTML = `<span class="${statusClass}">${currentStatus}</span> <span class="status-reason">(${statusReason})</span>`;

        // 4. Display Hours Preview
        adminPreviewHours.innerHTML = ''; let hoursHtml = '<h4>Regular Hours</h4><ul>';
        daysOfWeek.forEach(day => {
            const dayData = currentFormData.regularHours[day]; const highlightClass = (day === previewDayName) ? 'current-day-preview' : '';
            hoursHtml += `<li class="${highlightClass}"><strong>${capitalizeFirstLetter(day)}:</strong> ${dayData && !dayData.isClosed && dayData.open && dayData.close ? `<span>${formatTimeForAdminPreview(dayData.open)} - ${formatTimeForAdminPreview(dayData.close)} ET</span>` : '<span>Closed</span>'}</li>`;
        });
        hoursHtml += '</ul>';
        // Add preview for temp and holiday hours (optional)
        adminPreviewHours.innerHTML = hoursHtml;

        // 5. Display Contact
        if (currentFormData.contactEmail) { adminPreviewContact.innerHTML = `Contact: <a href="mailto:${currentFormData.contactEmail}">${currentFormData.contactEmail}</a>`; } else { adminPreviewContact.innerHTML = ''; }
    }

    function setupBusinessInfoListeners() {
        if (!businessInfoForm) return;
        if (businessInfoForm.dataset.listenerAttached === 'true') return;
        businessInfoForm.dataset.listenerAttached = 'true';

        addListenerSafe(addHolidayButton, 'click', () => { if (typeof renderHolidayEntry === 'function' && holidayHoursList) holidayHoursList.appendChild(renderHolidayEntry({ isClosed: true }, holidayHoursList.children.length)); }, '_addHolBtn');
        addListenerSafe(addTemporaryButton, 'click', () => { if (typeof renderTemporaryEntry === 'function' && temporaryHoursList) temporaryHoursList.appendChild(renderTemporaryEntry({ isClosed: false }, temporaryHoursList.children.length)); }, '_addTempBtn');
        addListenerSafe(businessInfoForm, 'submit', saveBusinessInfoData, '_bizSubmit');

        if (typeof updateAdminPreview === 'function') {
            addListenerSafe(businessInfoForm, 'input', (e) => { if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT' || e.target.tagName === 'TEXTAREA')) updateAdminPreview(); }, '_preview_input');
            addListenerSafe(businessInfoForm, 'change', (e) => { if (e.target && e.target.type === 'checkbox') updateAdminPreview(); }, '_preview_change');
            const listObserver = new MutationObserver(() => updateAdminPreview());
            if (holidayHoursList) listObserver.observe(holidayHoursList, { childList: true });
            if (temporaryHoursList) listObserver.observe(temporaryHoursList, { childList: true });
        }
    }

    // ========================================================================
    // --- Section: Shoutouts Management ---
    // ========================================================================

    function renderAdminListItem(container, docId, platform, itemData, deleteHandler, editHandler) {
        if (!container) return;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item-admin';
        itemDiv.setAttribute('data-id', docId);

        const nickname = itemData.nickname || 'N/A';
        const username = itemData.username || 'N/A';
        const order = itemData.order ?? 'N/A';
        const isVerified = itemData.isVerified || false;
        const profilePicUrl = itemData.profilePic || 'images/default-profile.jpg';
        let countText = '';

        if (platform === 'youtube') countText = `Subs: ${itemData.subscribers || 'N/A'}`;
        else countText = `Followers: ${itemData.followers || 'N/A'}`;

        let directLinkUrl = '#';
        if (platform === 'tiktok') directLinkUrl = `https://tiktok.com/@${username}`;
        else if (platform === 'instagram') directLinkUrl = `https://instagram.com/${username}`;
        else if (platform === 'youtube') directLinkUrl = `https://www.youtube.com/${username.startsWith('@') ? username : '@' + username}`;

        let verifiedIndicatorHTML = '';
        if (isVerified) {
            let badgeSrc = '';
            if (platform === 'tiktok') badgeSrc = 'check.png';
            else if (platform === 'instagram') badgeSrc = 'instagramcheck.png';
            else if (platform === 'youtube') badgeSrc = 'youtubecheck.png';
            if (badgeSrc) verifiedIndicatorHTML = `<img src="${badgeSrc}" alt="Verified Badge" class="verified-badge-admin-list">`;
        }

        itemDiv.innerHTML = `
            <div class="item-content">
                <div class="admin-list-item-pfp-container">
                    <img src="${profilePicUrl}" alt="PFP for ${nickname}" class="admin-list-item-pfp" onerror="this.onerror=null; this.src='images/default-profile.jpg';">
                </div>
                <div class="item-details">
                    <div class="name-line"><strong>${nickname}</strong>${verifiedIndicatorHTML}</div>
                    <span>(@${username})</span>
                    <small>Order: ${order} | ${countText}</small>
                </div>
            </div>
            <div class="item-actions">
                <a href="${directLinkUrl}" target="_blank" rel="noopener noreferrer" class="direct-link small-button" title="Visit Profile/Channel"><i class="fas fa-external-link-alt"></i> Visit</a>
                <button type="button" class="edit-button small-button">Edit</button>
                <button type="button" class="delete-button small-button">Delete</button>
            </div>`;

        itemDiv.querySelector('.edit-button').addEventListener('click', () => editHandler(docId, platform));
        itemDiv.querySelector('.delete-button').addEventListener('click', () => deleteHandler(docId, platform, itemDiv));
        container.appendChild(itemDiv);
    }

    function renderTikTokCard(account) {
        const verifiedBadge = account.isVerified ? '<img src="check.png" alt="Verified" class="verified-badge">' : '';
        return `
            <div class="creator-card">
                <img src="${account.profilePic || 'images/default-profile.jpg'}" alt="@${account.username}" class="creator-pic" onerror="this.onerror=null; this.src='images/default-profile.jpg';">
                <div class="creator-info">
                    <div class="creator-header"><h3>${account.nickname || 'N/A'} ${verifiedBadge}</h3></div>
                    <p class="creator-username">@${account.username || 'N/A'}</p>
                    <p class="creator-bio">${account.bio || ''}</p>
                    <p class="follower-count">${account.followers || 'N/A'} Followers</p>
                    <a href="https://tiktok.com/@${account.username || ''}" target="_blank" rel="noopener noreferrer" class="visit-profile"> Visit Profile </a>
                </div>
            </div>`;
    }

    function renderInstagramCard(account) {
        const verifiedBadge = account.isVerified ? '<img src="instagramcheck.png" alt="Verified" class="instagram-verified-badge">' : '';
        return `
            <div class="instagram-creator-card">
                <img src="${account.profilePic || 'images/default-profile.jpg'}" alt="${account.nickname}" class="instagram-creator-pic" onerror="this.onerror=null; this.src='images/default-profile.jpg';">
                <div class="instagram-creator-info">
                    <div class="instagram-creator-header"><h3>${account.nickname || 'N/A'} ${verifiedBadge}</h3></div>
                    <p class="instagram-creator-username">@${account.username || 'N/A'}</p>
                    <p class="instagram-creator-bio">${account.bio || ''}</p>
                    <p class="instagram-follower-count">${account.followers || 'N/A'} Followers</p>
                    <a href="https://instagram.com/${account.username || ''}" target="_blank" rel="noopener noreferrer" class="instagram-visit-profile"> Visit Profile </a>
                </div>
            </div>`;
    }

    function renderYouTubeCard(account) {
        let safeUsername = account.username || 'N/A';
        if (safeUsername !== 'N/A' && !safeUsername.startsWith('@')) {
            safeUsername = `@${safeUsername}`;
        }
        const channelUrl = (account.username && account.username !== 'N/A') ? `https://www.youtube.com/${safeUsername}` : '#';
        const verifiedBadge = account.isVerified ? '<img src="youtubecheck.png" alt="Verified" class="youtube-verified-badge">' : '';
        return `
            <div class="youtube-creator-card">
                ${account.coverPhoto ? `<img src="${account.coverPhoto}" alt="${account.nickname} Cover Photo" class="youtube-cover-photo" onerror="this.style.display='none'">` : ''}
                <img src="${account.profilePic || 'images/default-profile.jpg'}" alt="${account.nickname}" class="youtube-creator-pic" onerror="this.onerror=null; this.src='images/default-profile.jpg';">
                <div class="youtube-creator-info">
                    <div class="youtube-creator-header"><h3>${account.nickname || 'N/A'} ${verifiedBadge}</h3></div>
                    <div class="username-container"><p class="youtube-creator-username">${safeUsername}</p></div>
                    <p class="youtube-creator-bio">${account.bio || ''}</p>
                    <p class="youtube-subscriber-count">${account.subscribers || 'N/A'} Subscribers</p>
                    <a href="${channelUrl}" target="_blank" rel="noopener noreferrer" class="youtube-visit-profile"> Visit Channel </a>
                </div>
            </div>`;
    }

    function updateShoutoutPreview(formType, platform) {
        let formElement, previewElement;
        if (formType === 'add') {
            formElement = document.getElementById(`add-shoutout-${platform}-form`);
            previewElement = document.getElementById(`add-${platform}-preview`);
        } else if (formType === 'edit') {
            formElement = editForm;
            previewElement = editShoutoutPreview;
            if (editForm.getAttribute('data-platform') !== platform) return;
        } else return;

        if (!formElement || !previewElement) return;

        const accountData = {
            username: formElement.querySelector(`[name="username"]`)?.value.trim() || '',
            nickname: formElement.querySelector(`[name="nickname"]`)?.value.trim() || '',
            bio: formElement.querySelector(`[name="bio"]`)?.value.trim() || '',
            profilePic: formElement.querySelector(`[name="profilePic"]`)?.value.trim() || '',
            isVerified: formElement.querySelector(`[name="isVerified"]`)?.checked || false,
        };

        if (platform === 'youtube') {
            accountData.subscribers = formElement.querySelector(`[name="subscribers"]`)?.value.trim() || 'N/A';
            accountData.coverPhoto = formElement.querySelector(`[name="coverPhoto"]`)?.value.trim() || null;
        } else {
            accountData.followers = formElement.querySelector(`[name="followers"]`)?.value.trim() || 'N/A';
        }

        let renderFunction;
        if (platform === 'tiktok') renderFunction = renderTikTokCard;
        else if (platform === 'instagram') renderFunction = renderInstagramCard;
        else if (platform === 'youtube') renderFunction = renderYouTubeCard;
        else return;

        if (typeof renderFunction === 'function') {
            previewElement.innerHTML = renderFunction(accountData);
        }
    }

    async function updateMetadataTimestamp(platform) {
         try {
             await setDoc(shoutoutsMetaRef, { [`lastUpdatedTime_${platform}`]: serverTimestamp() }, { merge: true });
             console.log(`Metadata timestamp updated for ${platform}.`);
         } catch (error) {
             console.error(`Error updating timestamp for ${platform}:`, error);
         }
    }

    async function loadShoutoutsAdmin(platform) {
        const listContainer = document.getElementById(`shoutouts-${platform}-list-admin`);
        if (!listContainer) { console.error(`List container not found for platform: ${platform}`); return; }
        listContainer.innerHTML = `<p>Loading ${platform} shoutouts...</p>`;
        allShoutouts[platform] = [];

        try {
            const shoutoutQuery = query(collection(db, 'shoutouts'), where("platform", "==", platform), orderBy("order", "asc"));
            const querySnapshot = await getDocs(shoutoutQuery);
            querySnapshot.forEach((docSnapshot) => {
                allShoutouts[platform].push({ id: docSnapshot.id, ...docSnapshot.data() });
            });
            displayFilteredShoutouts(platform);
        } catch (error) {
            console.error(`Error loading ${platform} shoutouts:`, error);
            listContainer.innerHTML = `<p class="error">Error loading ${platform} shoutouts. Missing index?</p>`;
        }
    }

    function displayFilteredShoutouts(platform) {
        const listContainer = document.getElementById(`shoutouts-${platform}-list-admin`);
        const countElement = document.getElementById(`${platform}-count`);
        const searchInput = document.getElementById(`search-${platform}`);
        const searchTerm = searchInput.value.trim().toLowerCase();

        const filteredList = allShoutouts[platform].filter(account => {
            if (!searchTerm) return true;
            return (account.nickname || '').toLowerCase().includes(searchTerm) || (account.username || '').toLowerCase().includes(searchTerm);
        });

        listContainer.innerHTML = '';
        if (filteredList.length > 0) {
            filteredList.forEach(account => {
                renderAdminListItem(listContainer, account.id, platform, account, handleDeleteShoutout, openEditModal);
            });
        } else {
            listContainer.innerHTML = searchTerm ? `<p>No shoutouts found matching "${searchTerm}".</p>` : `<p>No ${platform} shoutouts found.</p>`;
        }
        if (countElement) countElement.textContent = `(${filteredList.length})`;
    }

    async function handleAddShoutout(platform, formElement) {
        if (isAddingShoutout) return;
        isAddingShoutout = true;

        const username = formElement.querySelector(`[name="username"]`)?.value.trim();
        const nickname = formElement.querySelector(`[name="nickname"]`)?.value.trim();
        const orderStr = formElement.querySelector(`[name="order"]`)?.value.trim();
        const order = parseInt(orderStr);

        if (!username || !nickname || !orderStr || isNaN(order) || order < 0) {
            showAdminStatus(`Invalid input for ${platform}. Check required fields and ensure Order is non-negative.`, true);
            isAddingShoutout = false; return;
        }

        try {
            const duplicateCheckQuery = query(collection(db, 'shoutouts'), where("platform", "==", platform), where("username", "==", username), limit(1));
            const querySnapshot = await getDocs(duplicateCheckQuery);
            if (!querySnapshot.empty) {
                showAdminStatus(`Error: A shoutout for username '@${username}' on platform '${platform}' already exists.`, true);
                isAddingShoutout = false; return;
            }

            const accountData = {
                platform: platform, username: username, nickname: nickname, order: order,
                isVerified: formElement.querySelector(`[name="isVerified"]`)?.checked || false,
                bio: formElement.querySelector(`[name="bio"]`)?.value.trim() || null,
                profilePic: formElement.querySelector(`[name="profilePic"]`)?.value.trim() || null,
                createdAt: serverTimestamp(), isEnabled: true
            };
            if (platform === 'youtube') {
                accountData.subscribers = formElement.querySelector(`[name="subscribers"]`)?.value.trim() || 'N/A';
                accountData.coverPhoto = formElement.querySelector(`[name="coverPhoto"]`)?.value.trim() || null;
            } else {
                accountData.followers = formElement.querySelector(`[name="followers"]`)?.value.trim() || 'N/A';
            }

            const docRef = await addDoc(collection(db, 'shoutouts'), accountData);
            await updateMetadataTimestamp(platform);
            logAdminActivity('SHOUTOUT_ADD', { platform: platform, username: username, id: docRef.id });
            showAdminStatus(`${platform} shoutout added successfully.`, false);
            formElement.reset();
            const previewArea = formElement.querySelector(`#add-${platform}-preview`);
            if (previewArea) previewArea.innerHTML = '<p><small>Preview will appear here as you type.</small></p>';
            loadShoutoutsAdmin(platform);

        } catch (error) {
            console.error(`Error adding ${platform} shoutout:`, error);
            showAdminStatus(`Error adding ${platform} shoutout: ${error.message}`, true);
        } finally {
            isAddingShoutout = false;
        }
    }

    async function handleUpdateShoutout(event) {
        event.preventDefault();
        const docId = editForm.getAttribute('data-doc-id');
        const platform = editForm.getAttribute('data-platform');
        if (!docId || !platform) { showAdminStatus("Error: Missing update data.", true); return; }

        const username = editUsernameInput?.value.trim();
        const nickname = editNicknameInput?.value.trim();
        const orderStr = editOrderInput?.value.trim();
        const order = parseInt(orderStr);

        if (!username || !nickname || !orderStr || isNaN(order) || order < 0) {
             showAdminStatus(`Update Error: Invalid input.`, true); return;
        }

        const newDataFromForm = {
            username: username, nickname: nickname, order: order,
            isVerified: editIsVerifiedInput?.checked || false,
            bio: editBioInput?.value.trim() || null,
            profilePic: editProfilePicInput?.value.trim() || null,
        };
        if (platform === 'youtube') {
            newDataFromForm.subscribers = editSubscribersInput?.value.trim() || 'N/A';
            newDataFromForm.coverPhoto = editCoverPhotoInput?.value.trim() || null;
        } else {
            newDataFromForm.followers = editFollowersInput?.value.trim() || 'N/A';
        }

        showAdminStatus("Updating shoutout...");
        const docRef = doc(db, 'shoutouts', docId);

        try {
            await updateDoc(docRef, { ...newDataFromForm, lastModified: serverTimestamp() });
            await updateMetadataTimestamp(platform);
            showAdminStatus(`${platform} shoutout updated successfully.`, false);
            logAdminActivity('SHOUTOUT_UPDATE', { platform: platform, username: username, id: docId });
            closeEditModal();
            loadShoutoutsAdmin(platform);
        } catch (error) {
            console.error(`Error updating ${platform} shoutout:`, error);
            showAdminStatus(`Error updating ${platform} shoutout: ${error.message}`, true);
        }
    }

    async function handleDeleteShoutout(docId, platform) {
        if (!confirm(`Are you sure you want to permanently delete this ${platform} shoutout?`)) return;
        showAdminStatus("Deleting shoutout...");
        const docRef = doc(db, 'shoutouts', docId);
        try {
            // Log details before deleting
            let detailsToLog = { platform: platform, id: docId };
            try {
                const docSnap = await getDoc(docRef);
                if (docSnap.exists()) detailsToLog.username = docSnap.data().username || 'N/A';
            } catch (e) {}

            await deleteDoc(docRef);
            await updateMetadataTimestamp(platform);
            showAdminStatus(`${platform} shoutout deleted successfully.`, false);
            logAdminActivity('SHOUTOUT_DELETE', detailsToLog);
            loadShoutoutsAdmin(platform);
        } catch (error) {
            console.error(`Error deleting ${platform} shoutout:`, error);
            showAdminStatus(`Error deleting ${platform} shoutout: ${error.message}`, true);
        }
    }

    function openEditModal(docId, platform) {
        if (!editModal || !editForm) { console.error("Edit modal/form not found."); return; }
        editForm.setAttribute('data-doc-id', docId);
        editForm.setAttribute('data-platform', platform);
        const docRef = doc(db, 'shoutouts', docId);

        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                if (editUsernameInput) editUsernameInput.value = data.username || '';
                if (editNicknameInput) editNicknameInput.value = data.nickname || '';
                if (editOrderInput) editOrderInput.value = data.order ?? '';
                if (editIsVerifiedInput) editIsVerifiedInput.checked = data.isVerified || false;
                if (editBioInput) editBioInput.value = data.bio || '';
                if (editProfilePicInput) editProfilePicInput.value = data.profilePic || '';

                const followersDiv = editPlatformSpecificDiv?.querySelector('.edit-followers-group');
                const subscribersDiv = editPlatformSpecificDiv?.querySelector('.edit-subscribers-group');
                const coverPhotoDiv = editPlatformSpecificDiv?.querySelector('.edit-coverphoto-group');

                if (followersDiv) followersDiv.style.display = 'none';
                if (subscribersDiv) subscribersDiv.style.display = 'none';
                if (coverPhotoDiv) coverPhotoDiv.style.display = 'none';

                if (platform === 'youtube') {
                    if (editSubscribersInput) editSubscribersInput.value = data.subscribers || 'N/A';
                    if (editCoverPhotoInput) editCoverPhotoInput.value = data.coverPhoto || '';
                    if (subscribersDiv) subscribersDiv.style.display = 'block';
                    if (coverPhotoDiv) coverPhotoDiv.style.display = 'block';
                } else {
                    if (editFollowersInput) editFollowersInput.value = data.followers || 'N/A';
                    if (followersDiv) followersDiv.style.display = 'block';
                }
                updateShoutoutPreview('edit', platform);
                editModal.style.display = 'block';
            } else {
                 showAdminStatus("Error: Could not load data for editing.", true);
            }
        }).catch(error => {
             console.error("Error getting document for edit:", error);
             showAdminStatus(`Error loading data: ${error.message}`, true);
         });
    }

    function closeEditModal() {
        if (editModal) editModal.style.display = 'none';
        if (editForm) editForm.reset();
        editForm?.removeAttribute('data-doc-id');
        editForm?.removeAttribute('data-platform');
         if(editShoutoutPreview) editShoutoutPreview.innerHTML = '<p><small>Preview will appear here.</small></p>';
    }

    // ========================================================================
    // --- Section: Useful Links Management ---
    // ========================================================================

    function renderUsefulLinkAdminListItem(container, docId, label, url, order, deleteHandler, editHandler) {
        if (!container) return;
        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item-admin';
        itemDiv.setAttribute('data-id', docId);
        itemDiv.innerHTML = `
            <div class="item-content">
                 <div class="item-details">
                    <strong>${label || 'N/A'}</strong>
                    <span>(${url || 'N/A'})</span>
                    <small>Order: ${order ?? 'N/A'}</small>
                 </div>
            </div>
            <div class="item-actions">
                <a href="${url || '#'}" target="_blank" rel="noopener noreferrer" class="direct-link small-button" title="Visit Link"><i class="fas fa-external-link-alt"></i> Visit</a>
                <button type="button" class="edit-button small-button">Edit</button>
                <button type="button" class="delete-button small-button">Delete</button>
            </div>`;
        itemDiv.querySelector('.edit-button').addEventListener('click', () => editHandler(docId));
        itemDiv.querySelector('.delete-button').addEventListener('click', () => deleteHandler(docId, itemDiv));
        container.appendChild(itemDiv);
    }

    async function loadUsefulLinksAdmin() {
        if (!usefulLinksListAdmin) return;
        usefulLinksListAdmin.innerHTML = `<p>Loading useful links...</p>`;
        allUsefulLinks = [];
        try {
            const linkQuery = query(usefulLinksCollectionRef, orderBy("order", "asc"));
            const querySnapshot = await getDocs(linkQuery);
            querySnapshot.forEach((doc) => allUsefulLinks.push({ id: doc.id, ...doc.data() }));
            displayFilteredUsefulLinks();
        } catch (error) {
            usefulLinksListAdmin.innerHTML = `<p class="error">Error loading links.</p>`;
        }
    }

    function displayFilteredUsefulLinks() {
        if (!usefulLinksListAdmin || !searchInputUsefulLinks) return;
        const searchTerm = searchInputUsefulLinks.value.trim().toLowerCase();
        usefulLinksListAdmin.innerHTML = '';
        const listToRender = allUsefulLinks.filter(link => !searchTerm || (link.label || '').toLowerCase().includes(searchTerm));

        listToRender.forEach(link => {
             renderUsefulLinkAdminListItem(usefulLinksListAdmin, link.id, link.label, link.url, link.order, handleDeleteUsefulLink, openEditUsefulLinkModal);
        });
        if (listToRender.length === 0) {
            usefulLinksListAdmin.innerHTML = searchTerm ? `<p>No useful links found matching "${searchTerm}".</p>` : `<p>No useful links found.</p>`;
        }
        if (usefulLinksCount) usefulLinksCount.textContent = `(${listToRender.length})`;
    }

    async function handleAddUsefulLink(event) {
        event.preventDefault();
        const label = addUsefulLinkForm.querySelector('#link-label')?.value.trim();
        const url = addUsefulLinkForm.querySelector('#link-url')?.value.trim();
        const orderStr = addUsefulLinkForm.querySelector('#link-order')?.value.trim();
        const order = parseInt(orderStr);

        if (!label || !url || !orderStr || isNaN(order) || order < 0) { showAdminStatus("Invalid input for Useful Link.", true); return; }
        try { new URL(url); } catch (_) { showAdminStatus("Invalid URL format.", true); return; }

        showAdminStatus("Adding useful link...");
        try {
            await addDoc(usefulLinksCollectionRef, { label, url, order, createdAt: serverTimestamp() });
            showAdminStatus("Useful link added successfully.", false);
            addUsefulLinkForm.reset();
            loadUsefulLinksAdmin();
        } catch (error) { showAdminStatus(`Error adding useful link: ${error.message}`, true); }
    }

    async function handleDeleteUsefulLink(docId) {
        if (!confirm("Are you sure you want to permanently delete this useful link?")) return;
        showAdminStatus("Deleting useful link...");
        try {
            await deleteDoc(doc(db, 'useful_links', docId));
            showAdminStatus("Useful link deleted successfully.", false);
            loadUsefulLinksAdmin();
        } catch (error) { showAdminStatus(`Error deleting useful link: ${error.message}`, true); }
    }

    function openEditUsefulLinkModal(docId) {
        if (!editUsefulLinkModal || !editUsefulLinkForm) return;
        const docRef = doc(db, 'useful_links', docId);
        showEditLinkStatus("Loading link data...");
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                editUsefulLinkForm.setAttribute('data-doc-id', docId);
                if (editLinkLabelInput) editLinkLabelInput.value = data.label || '';
                if (editLinkUrlInput) editLinkUrlInput.value = data.url || '';
                if (editLinkOrderInput) editLinkOrderInput.value = data.order ?? '';
                editUsefulLinkModal.style.display = 'block';
                showEditLinkStatus("");
            }
        }).catch(error => showAdminStatus(`Error loading link data: ${error.message}`, true));
    }

    function closeEditUsefulLinkModal() {
        if (editUsefulLinkModal) editUsefulLinkModal.style.display = 'none';
        if (editUsefulLinkForm) editUsefulLinkForm.reset();
        if (editLinkStatusMessage) editLinkStatusMessage.textContent = '';
    }

    async function handleUpdateUsefulLink(event) {
        event.preventDefault();
        const docId = editUsefulLinkForm.getAttribute('data-doc-id');
        if (!docId) { showEditLinkStatus("Error: Missing document ID.", true); return; }

        const label = editLinkLabelInput?.value.trim();
        const url = editLinkUrlInput?.value.trim();
        const orderStr = editLinkOrderInput?.value.trim();
        const order = parseInt(orderStr);

        if (!label || !url || !orderStr || isNaN(order) || order < 0) { showEditLinkStatus("Invalid input.", true); return; }
        try { new URL(url); } catch (_) { showEditLinkStatus("Invalid URL format.", true); return; }

        showEditLinkStatus("Saving changes...");
        try {
            await updateDoc(doc(db, 'useful_links', docId), { label, url, order, lastModified: serverTimestamp() });
            showAdminStatus("Useful link updated successfully.", false);
            logAdminActivity('USEFUL_LINK_UPDATE', { id: docId, label: label });
            closeEditUsefulLinkModal();
            loadUsefulLinksAdmin();
        } catch (error) { showEditLinkStatus(`Error saving: ${error.message}`, true); }
    }

    // ========================================================================
    // --- Section: Social Links Management ---
    // ========================================================================

    function renderSocialLinkAdminListItem(container, docId, label, url, order, deleteHandler, editHandler) {
       if (!container) return;
       const itemDiv = document.createElement('div');
       itemDiv.className = 'list-item-admin';
       itemDiv.setAttribute('data-id', docId);
       let visitUrl = '#';
       try { if (url) visitUrl = new URL(url).href; } catch (e) {}

       itemDiv.innerHTML = `
           <div class="item-content"><div class="item-details">
               <strong>${label || 'N/A'}</strong><span>(${url || 'N/A'})</span><small>Order: ${order ?? 'N/A'}</small>
           </div></div>
           <div class="item-actions">
               <a href="${visitUrl}" target="_blank" rel="noopener noreferrer" class="direct-link small-button" title="Visit Link"><i class="fas fa-external-link-alt"></i> Visit</a>
               <button type="button" class="edit-button small-button">Edit</button>
               <button type="button" class="delete-button small-button">Delete</button>
           </div>`;

       itemDiv.querySelector('.edit-button').addEventListener('click', () => editHandler(docId));
       itemDiv.querySelector('.delete-button').addEventListener('click', () => deleteHandler(docId, itemDiv));
       container.appendChild(itemDiv);
   }

    async function loadSocialLinksAdmin() {
        if (!socialLinksListAdmin) return;
        socialLinksListAdmin.innerHTML = `<p>Loading social links...</p>`;
        allSocialLinks = [];
        try {
            const linkQuery = query(socialLinksCollectionRef, orderBy("order", "asc"));
            const querySnapshot = await getDocs(linkQuery);
            querySnapshot.forEach((doc) => allSocialLinks.push({ id: doc.id, ...doc.data() }));
            displayFilteredSocialLinks();
        } catch (error) { socialLinksListAdmin.innerHTML = `<p class="error">Error loading social links.</p>`; }
    }

    function displayFilteredSocialLinks() {
        if (!socialLinksListAdmin || !searchInputSocialLinks || !socialLinksCount) return;
        const searchTerm = searchInputSocialLinks.value.trim().toLowerCase();
        socialLinksListAdmin.innerHTML = '';
        const listToRender = allSocialLinks.filter(link => !searchTerm || (link.label || '').toLowerCase().includes(searchTerm) || (link.url || '').toLowerCase().includes(searchTerm));

        listToRender.forEach(link => {
            renderSocialLinkAdminListItem(socialLinksListAdmin, link.id, link.label, link.url, link.order, handleDeleteSocialLink, openEditSocialLinkModal);
        });
        if (listToRender.length === 0) socialLinksListAdmin.innerHTML = searchTerm ? `<p>No social links found matching "${searchTerm}".</p>` : `<p>No social links found.</p>`;
        socialLinksCount.textContent = `(${listToRender.length})`;
    }

    async function handleAddSocialLink(event) {
        event.preventDefault();
        const label = addSocialLinkForm.querySelector('#social-link-label')?.value.trim();
        const url = addSocialLinkForm.querySelector('#social-link-url')?.value.trim();
        const orderStr = addSocialLinkForm.querySelector('#social-link-order')?.value.trim();
        const order = parseInt(orderStr);
        const iconClassValue = addSocialLinkForm.querySelector('#social-link-icon-class')?.value.trim();

        if (!label || !url || !orderStr || isNaN(order) || order < 0) { showAdminStatus("Invalid input for Social Link.", true); return; }
        try { new URL(url); } catch (_) { showAdminStatus("Invalid URL format.", true); return; }

        const linkData = { label, url, order, createdAt: serverTimestamp() };
        if (iconClassValue) linkData.iconClass = iconClassValue;

        showAdminStatus("Adding social link...");
        try {
            await addDoc(socialLinksCollectionRef, linkData);
            showAdminStatus("Social link added successfully.", false);
            addSocialLinkForm.reset();
            loadSocialLinksAdmin();
        } catch (error) { showAdminStatus(`Error adding social link: ${error.message}`, true); }
    }

    async function handleDeleteSocialLink(docId) {
        if (!confirm("Are you sure you want to permanently delete this social link?")) return;
        showAdminStatus("Deleting social link...");
        try {
            await deleteDoc(doc(db, 'social_links', docId));
            showAdminStatus("Social link deleted successfully.", false);
            loadSocialLinksAdmin();
        } catch (error) { showAdminStatus(`Error deleting social link: ${error.message}`, true); }
    }

    function openEditSocialLinkModal(docId) {
        if (!editSocialLinkModal || !editSocialLinkForm) return;
        const docRef = doc(db, 'social_links', docId);
        showEditSocialLinkStatus("Loading link data...");
        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                editSocialLinkForm.setAttribute('data-doc-id', docId);
                if(editSocialLinkLabelInput) editSocialLinkLabelInput.value = data.label || '';
                if(editSocialLinkUrlInput) editSocialLinkUrlInput.value = data.url || '';
                if(editSocialLinkOrderInput) editSocialLinkOrderInput.value = data.order ?? '';
                if(editSocialLinkIconClassInput) editSocialLinkIconClassInput.value = data.iconClass || '';
                editSocialLinkModal.style.display = 'block';
                showEditSocialLinkStatus("");
            }
        }).catch(error => showAdminStatus(`Error loading link data: ${error.message}`, true));
    }

    function closeEditSocialLinkModal() {
       if (editSocialLinkModal) editSocialLinkModal.style.display = 'none';
       if (editSocialLinkForm) editSocialLinkForm.reset();
       if (editSocialLinkStatusMessage) editSocialLinkStatusMessage.textContent = '';
    }

    async function handleUpdateSocialLink(event) {
        event.preventDefault();
        const docId = editSocialLinkForm.getAttribute('data-doc-id');
        if (!docId) { showEditSocialLinkStatus("Error: Missing document ID.", true); return; }

        const label = editSocialLinkLabelInput?.value.trim();
        const url = editSocialLinkUrlInput?.value.trim();
        const orderStr = editSocialLinkOrderInput?.value.trim();
        const order = parseInt(orderStr);
        const iconClassValue = editSocialLinkIconClassInput?.value.trim();

        if (!label || !url || !orderStr || isNaN(order) || order < 0) { showEditSocialLinkStatus("Invalid input.", true); return; }
        try { new URL(url); } catch (_) { showEditSocialLinkStatus("Invalid URL format.", true); return; }

        const newData = { label, url, order };
        if (iconClassValue) newData.iconClass = iconClassValue;
        else newData.iconClass = deleteField();

        showEditSocialLinkStatus("Saving changes...");
        try {
            await updateDoc(doc(db, 'social_links', docId), { ...newData, lastModified: serverTimestamp() });
            showAdminStatus("Social link updated successfully.", false);
            closeEditSocialLinkModal();
            loadSocialLinksAdmin();
        } catch (error) { showEditSocialLinkStatus(`Error saving: ${error.message}`, true); }
    }

    // ========================================================================
    // --- Section: Disabilities Management ---
    // ========================================================================

    /**
     * Renders a single Disability Link item in the admin list view.
     * (Includes icon integration from user request)
     */
    function renderDisabilityAdminListItem(container, docId, name, url, order, iconClass, deleteHandler, editHandler) {
        if (!container) { console.warn("Disabilities list container not found during render."); return; }

        const itemDiv = document.createElement('div');
        itemDiv.className = 'list-item-admin';
        itemDiv.setAttribute('data-id', docId);

        let displayUrl = url || 'N/A';
        let visitUrl = '#';
        try { if (url) visitUrl = new URL(url).href; } catch (e) { displayUrl += " (Invalid URL)"; }

        const effectiveIconClass = iconClass || 'fa-universal-access'; // Default icon

        itemDiv.innerHTML = `
            <div class="item-content">
                <div class="item-details" style="display: flex; align-items: center; gap: 10px;">
                    <span class="disability-icon" style="width: 20px; text-align: center; font-size: 1.1em;">
                        <i class="fas ${effectiveIconClass}" aria-hidden="true"></i>
                    </span>
                    <div>
                        <strong>${name || 'N/A'}</strong>
                        <span>(${displayUrl})</span>
                        <small style="display: block;">Order: ${order ?? 'N/A'}</small>
                    </div>
                </div>
            </div>
            <div class="item-actions">
                <a href="${visitUrl}" target="_blank" rel="noopener noreferrer" class="direct-link small-button" title="Visit Info Link"><i class="fas fa-external-link-alt"></i> Visit</a>
                <button type="button" class="edit-button small-button">Edit</button>
                <button type="button" class="delete-button small-button">Delete</button>
            </div>`;

        itemDiv.querySelector('.edit-button').addEventListener('click', () => editHandler(docId));
        itemDiv.querySelector('.delete-button').addEventListener('click', () => deleteHandler(docId, itemDiv));
        container.appendChild(itemDiv);
    }

    async function loadDisabilitiesAdmin() {
        if (!disabilitiesListAdmin) { console.error("Disabilities list container missing."); return; }
        if (disabilitiesCount) disabilitiesCount.textContent = '';
        disabilitiesListAdmin.innerHTML = `<p>Loading disability links...</p>`;
        allDisabilities = [];

        try {
            const disabilityQuery = query(disabilitiesCollectionRef, orderBy("order", "asc"));
            const querySnapshot = await getDocs(disabilityQuery);
            querySnapshot.forEach((doc) => {
                allDisabilities.push({ id: doc.id, ...doc.data() });
            });
            displayFilteredDisabilities();
        } catch (error) {
            console.error("Error loading disabilities:", error);
            disabilitiesListAdmin.innerHTML = `<p class="error">Error loading disabilities.</p>`;
        }
    }

    function displayFilteredDisabilities() {
        if (!disabilitiesListAdmin || !searchInputDisabilities) return;
        const searchTerm = searchInputDisabilities.value.trim().toLowerCase();

        const listToRender = allDisabilities.filter(item => !searchTerm || (item.name || '').toLowerCase().includes(searchTerm));

        disabilitiesListAdmin.innerHTML = '';
        if (listToRender.length > 0) {
            listToRender.forEach(item => {
                renderDisabilityAdminListItem(
                    disabilitiesListAdmin, item.id, item.name, item.url, item.order, item.iconClass, // Pass iconClass
                    handleDeleteDisability, openEditDisabilityModal
                );
            });
        } else {
            disabilitiesListAdmin.innerHTML = searchTerm ? `<p>No disabilities found matching "${searchTerm}".</p>` : `<p>No disabilities found.</p>`;
        }
        if (disabilitiesCount) disabilitiesCount.textContent = `(${listToRender.length})`;
    }

    async function handleAddDisability(event) {
        event.preventDefault();
        const nameInput = addDisabilityForm.querySelector('#disability-name');
        const urlInput = addDisabilityForm.querySelector('#disability-url');
        const orderInput = addDisabilityForm.querySelector('#disability-order');
        const iconInput = addDisabilityForm.querySelector('#disability-icon'); // Icon field from add form

        const name = nameInput?.value.trim();
        const url = urlInput?.value.trim();
        const orderStr = orderInput?.value.trim();
        const order = parseInt(orderStr);
        const iconClass = iconInput?.value.trim() || 'fa-universal-access';

        if (!name || !url || !orderStr || isNaN(order) || order < 0) {
            showAdminStatus("Invalid input for Disability Link. Check fields and order.", true); return;
        }
        try { new URL(url); } catch (_) { showAdminStatus("Invalid URL format.", true); return; }

        const disabilityData = { name, url, order, iconClass, createdAt: serverTimestamp() };

        showAdminStatus("Adding disability link...");
        try {
            await addDoc(disabilitiesCollectionRef, disabilityData);
            showAdminStatus("Disability link added successfully.", false);
            addDisabilityForm.reset();
            loadDisabilitiesAdmin();
        } catch (error) {
            console.error("Error adding disability link:", error);
            showAdminStatus(`Error adding disability link: ${error.message}`, true);
        }
    }

    async function handleDeleteDisability(docId) {
        if (!confirm("Are you sure you want to permanently delete this disability link?")) return;
        showAdminStatus("Deleting disability link...");
        try {
            await deleteDoc(doc(db, 'disabilities', docId));
            showAdminStatus("Disability link deleted successfully.", false);
            loadDisabilitiesAdmin();
        } catch (error) {
            showAdminStatus(`Error deleting disability link: ${error.message}`, true);
        }
    }

    function openEditDisabilityModal(docId) {
        if (!editDisabilityModal || !editDisabilityForm) return;
        const docRef = doc(db, 'disabilities', docId);
        showEditDisabilityStatus("Loading disability data...");

        getDoc(docRef).then(docSnap => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                editDisabilityForm.setAttribute('data-doc-id', docId);
                if (editDisabilityNameInput) editDisabilityNameInput.value = data.name || '';
                if (editDisabilityUrlInput) editDisabilityUrlInput.value = data.url || '';
                if (editDisabilityOrderInput) editDisabilityOrderInput.value = data.order ?? '';
                if (editDisabilityIconInput) editDisabilityIconInput.value = data.iconClass || 'fa-universal-access'; // Populate icon input

                editDisabilityModal.style.display = 'block';
                showEditDisabilityStatus("");
            } else {
                showAdminStatus("Error: Could not load disability data for editing.", true);
            }
        }).catch(error => {
            showAdminStatus(`Error loading disability data: ${error.message}`, true);
        });
    }

    function closeEditDisabilityModal() {
        if (editDisabilityModal) editDisabilityModal.style.display = 'none';
        if (editDisabilityForm) editDisabilityForm.reset();
        if (editDisabilityStatusMessage) editDisabilityStatusMessage.textContent = '';
    }

    async function handleUpdateDisability(event) {
        event.preventDefault();
        if (!editDisabilityForm) return;
        const docId = editDisabilityForm.getAttribute('data-doc-id');
        if (!docId) { showEditDisabilityStatus("Error: Missing document ID.", true); return; }

        const name = editDisabilityNameInput?.value.trim();
        const url = editDisabilityUrlInput?.value.trim();
        const orderStr = editDisabilityOrderInput?.value.trim();
        const order = parseInt(orderStr);
        const iconClass = editDisabilityIconInput?.value.trim() || 'fa-universal-access'; // Get icon value from edit form

        if (!name || !url || !orderStr || isNaN(order) || order < 0) { showEditDisabilityStatus("Invalid input.", true); return; }
        try { new URL(url); } catch (_) { showEditDisabilityStatus("Invalid URL format.", true); return; }

        const newDataFromForm = { name, url, order, iconClass }; // Add iconClass to update object
        showEditDisabilityStatus("Saving changes...");

        try {
            await updateDoc(doc(db, 'disabilities', docId), { ...newDataFromForm, lastModified: serverTimestamp() });
            showAdminStatus("Disability link updated successfully.", false);
            logAdminActivity('DISABILITY_LINK_UPDATE', { id: docId, name: name });
            closeEditDisabilityModal();
            loadDisabilitiesAdmin();
        } catch (error) {
            showEditDisabilityStatus(`Error saving: ${error.message}`, true);
        }
    }

    // ========================================================================
    // --- Section: Tech Items Management ---
    // ========================================================================

    function renderTechItemAdminListItem(container, docId, itemData, deleteHandler, editHandler) {
         if (!container) return;
         const itemDiv = document.createElement('div');
         itemDiv.className = 'list-item-admin';
         itemDiv.setAttribute('data-id', docId);
         itemDiv.innerHTML = `
             <div class="item-content">
                 <div class="item-details">
                     <strong>${itemData.name || 'N/A'}</strong>
                     <span>(${itemData.model || 'N/A'})</span>
                     <small>Order: ${itemData.order ?? 'N/A'} | OS: ${itemData.osVersion || '?'}</small>
                 </div>
             </div>
             <div class="item-actions">
                 <button type="button" class="edit-button small-button">Edit</button>
                 <button type="button" class="delete-button small-button">Delete</button>
             </div>`;
         itemDiv.querySelector('.edit-button').addEventListener('click', () => editHandler(docId));
         itemDiv.querySelector('.delete-button').addEventListener('click', () => deleteHandler(docId, itemDiv));
         container.appendChild(itemDiv);
    }

    function displayFilteredTechItems() {
         if (!techItemsListAdmin || !searchTechItemsInput) return;
         const searchTerm = searchTechItemsInput.value.trim().toLowerCase();
         techItemsListAdmin.innerHTML = '';
         const filteredList = allTechItems.filter(item => {
             if (!searchTerm) return true;
             return (item.name || '').toLowerCase().includes(searchTerm) || (item.model || '').toLowerCase().includes(searchTerm);
         });

         if (filteredList.length > 0) {
             filteredList.forEach(item => {
                 renderTechItemAdminListItem(techItemsListAdmin, item.id, item, handleDeleteTechItem, openEditTechItemModal);
             });
         } else {
              techItemsListAdmin.innerHTML = searchTerm ? `<p>No tech items found matching "${searchTerm}".</p>` : '<p>No tech items added yet.</p>';
         }
         if (techItemsCount) techItemsCount.textContent = `(${filteredList.length})`;
    }

    async function loadTechItemsAdmin() {
         if (!techItemsListAdmin) return;
         techItemsListAdmin.innerHTML = `<p>Loading tech items...</p>`;
         allTechItems = [];
         try {
             const techQuery = query(techItemsCollectionRef, orderBy("order", "asc"));
             const querySnapshot = await getDocs(techQuery);
             querySnapshot.forEach((doc) => allTechItems.push({ id: doc.id, ...doc.data() }));
             displayFilteredTechItems();
         } catch (error) {
             console.error("Error loading tech items:", error);
             techItemsListAdmin.innerHTML = `<p class="error">Error loading tech items.</p>`;
         }
    }

    function collectFormData(formElement) {
        const formData = {};
        const inputs = formElement.querySelectorAll('input[name], select[name], textarea[name]');
        let isValid = true;
        inputs.forEach(input => {
             const name = input.name; let value = input.value.trim();
             if (input.type === 'number') {
                 value = input.value === '' ? null : parseFloat(input.value);
                 if (input.value !== '' && isNaN(value)) isValid = false;
                 if (value !== null && value < 0) isValid = false;
             }
             formData[name] = value === '' ? null : value;
         });
         return { formData, isValid };
    }

    async function handleAddTechItem(event) {
        event.preventDefault();
        const { formData, isValid } = collectFormData(addTechItemForm);

        if (!isValid || !formData.name || formData.order === null) {
            showAdminStatus("Device Name and a valid non-negative Order are required, and numbers must be valid.", true);
            return;
        }

        formData.createdAt = serverTimestamp();
        showAdminStatus("Adding tech item...");
        try {
             const docRef = await addDoc(techItemsCollectionRef, formData);
             logAdminActivity('TECH_ITEM_ADD', { name: formData.name, id: docRef.id });
             showAdminStatus("Tech item added successfully.", false);
             addTechItemForm.reset();
             if (addTechItemPreview) addTechItemPreview.innerHTML = '<p><small>Preview will appear here as you type.</small></p>';
             loadTechItemsAdmin();
         } catch (error) { showAdminStatus(`Error adding tech item: ${error.message}`, true); }
    }

    async function handleDeleteTechItem(docId) {
        if (!confirm("Are you sure you want to permanently delete this tech item?")) return;
         showAdminStatus("Deleting tech item...");
         try {
             await deleteDoc(doc(db, 'tech_items', docId));
             logAdminActivity('TECH_ITEM_DELETE', { id: docId });
             showAdminStatus("Tech item deleted successfully.", false);
             loadTechItemsAdmin();
         } catch (error) { showAdminStatus(`Error deleting tech item: ${error.message}`, true); }
    }

    async function openEditTechItemModal(docId) {
         if (!editTechItemModal || !editTechItemForm) return;
         showEditTechItemStatus("Loading item data...");
         try {
             const docRef = doc(db, 'tech_items', docId); const docSnap = await getDoc(docRef);
             if (docSnap.exists()) {
                 const data = docSnap.data(); editTechItemForm.setAttribute('data-doc-id', docId);
                 editTechItemForm.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
                     input.value = data[input.name] ?? '';
                 });
                 editTechItemModal.style.display = 'block'; showEditTechItemStatus("");
                 updateTechItemPreview('edit');
             } else { showEditTechItemStatus("Error: Item not found.", true); }
         } catch (error) { showEditTechItemStatus(`Error: ${error.message}`, true); }
    }

    function closeEditTechItemModal() {
         if (editTechItemModal) editTechItemModal.style.display = 'none';
         if (editTechItemForm) editTechItemForm.reset();
         if (editTechStatusMessage) editTechStatusMessage.textContent = '';
    }

    async function handleUpdateTechItem(event) {
         event.preventDefault();
         const docId = editTechItemForm.getAttribute('data-doc-id');
         if (!docId) { showEditTechItemStatus("Error: Missing document ID.", true); return; }

         const { formData, isValid } = collectFormData(editTechItemForm);
         if (!isValid || !formData.name || formData.order === null) {
             showEditTechItemStatus("Device Name and a valid non-negative Order are required.", true); return;
         }

         formData.lastModified = serverTimestamp();
         showEditTechItemStatus("Saving changes...");
         try {
             await updateDoc(doc(db, 'tech_items', docId), formData);
             showAdminStatus("Tech item updated successfully.", false);
             logAdminActivity('TECH_ITEM_UPDATE', { name: formData.name, id: docId });
             closeEditTechItemModal();
             loadTechItemsAdmin();
         } catch (error) { showEditTechItemStatus(`Error saving: ${error.message}`, true); }
    }

    function renderTechItemPreview(data) {
         const name = data.name || 'Device Name'; const model = data.model || ''; const iconClass = data.iconClass || 'fas fa-question-circle';
         const material = data.material || ''; const storage = data.storage || ''; const batteryCapacity = data.batteryCapacity || '';
         const color = data.color || ''; const price = data.price ? `$${data.price}` : ''; const dateReleased = data.dateReleased || '';
         const dateBought = data.dateBought || ''; const osVersion = data.osVersion || '';
         const batteryHealth = data.batteryHealth !== null && !isNaN(data.batteryHealth) ? parseInt(data.batteryHealth, 10) : null;
         const batteryCycles = data.batteryCycles !== null && !isNaN(data.batteryCycles) ? data.batteryCycles : null;

         let batteryHtml = '';
         if (batteryHealth !== null) {
             let batteryClass = (batteryHealth <= 20) ? 'critical' : (batteryHealth <= 50 ? 'low-power' : '');
             batteryHtml = `<div class="tech-detail"><i class="fas fa-heart"></i><span>Battery Health:</span></div><div class="battery-container"><div class="battery-icon ${batteryClass}"><div class="battery-level" style="width: ${batteryHealth}%;"></div><div class="battery-percentage">${batteryHealth}%</div></div></div>`;
         }
         let cyclesHtml = '';
         if (batteryCycles !== null) {
             cyclesHtml = `<div class="tech-detail"><i class="fas fa-sync"></i><span>Battery Charge Cycles:</span> ${batteryCycles}</div>`;
         }

         return `<div class="tech-item"><h3><i class="${iconClass}"></i> ${name}</h3>
              ${model ? `<div class="tech-detail"><i class="fas fa-info-circle"></i><span>Model:</span> ${model}</div>` : ''}
              ${material ? `<div class="tech-detail"><i class="fas fa-layer-group"></i><span>Material:</span> ${material}</div>` : ''}
              ${storage ? `<div class="tech-detail"><i class="fas fa-hdd"></i><span>Storage:</span> ${storage}</div>` : ''}
              ${batteryCapacity ? `<div class="tech-detail"><i class="fas fa-battery-full"></i><span>Battery Capacity:</span> ${batteryCapacity}</div>` : ''}
              ${color ? `<div class="tech-detail"><i class="fas fa-palette"></i><span>Color:</span> ${color}</div>` : ''}
              ${price ? `<div class="tech-detail"><i class="fas fa-tag"></i><span>Price:</span> ${price}</div>` : ''}
              ${dateReleased ? `<div class="tech-detail"><i class="fas fa-calendar-plus"></i><span>Date Released:</span> ${dateReleased}</div>` : ''}
              ${dateBought ? `<div class="tech-detail"><i class="fas fa-shopping-cart"></i><span>Date Bought:</span> ${dateBought}</div>` : ''}
              ${osVersion ? `<div class="fab fa-apple"></i><span>OS Version:</span> ${osVersion}</div>` : ''}
              ${batteryHtml} ${cyclesHtml} </div>`;
    }

    function updateTechItemPreview(formType) {
          let formElement, previewElement;
          if (formType === 'add') { formElement = addTechItemForm; previewElement = addTechItemPreview; }
          else if (formType === 'edit') { formElement = editTechItemForm; previewElement = editTechItemPreview; }
          else return;
          if (!formElement || !previewElement) return;

          const { formData } = collectFormData(formElement);
          previewElement.innerHTML = renderTechItemPreview(formData);
     }

     function attachTechPreviewListeners(formElement, formType) {
          if (!formElement) return;
          formElement.querySelectorAll('input[name], select[name], textarea[name]').forEach(input => {
              const eventType = (input.type === 'checkbox' || input.type === 'select-one') ? 'change' : 'input';
              const listenerFlag = `__techPreviewListener_${eventType}`;
              if (!input[listenerFlag]) {
                  input.addEventListener(eventType, () => updateTechItemPreview(formType));
                  input[listenerFlag] = true;
              }
          });
     }

    // ========================================================================
    // --- Section: Activity Log ---
    // ========================================================================

    async function loadActivityLog() {
        const logListContainer = document.getElementById('activity-log-list');
        if (!logListContainer) return;
        logListContainer.innerHTML = '<p>Loading activity log...</p>';
        allActivityLogEntries = [];

        try {
            const logQuery = query(collection(db, "activity_log"), orderBy("timestamp", "desc"), limit(50));
            const querySnapshot = await getDocs(logQuery);
            querySnapshot.forEach(doc => allActivityLogEntries.push({ id: doc.id, ...doc.data() }));
            displayFilteredActivityLog();
        } catch (error) {
            console.error("Error loading activity log:", error);
            logListContainer.innerHTML = '<p class="error">Error loading activity log.</p>';
        }
    }

    function displayFilteredActivityLog() {
        const logListContainer = document.getElementById('activity-log-list');
        const searchInput = document.getElementById('search-activity-log');
        const logCountElement = document.getElementById('activity-log-count');
        if (!logListContainer || !searchInput || !logCountElement) return;

        const searchTerm = searchInput.value.trim().toLowerCase();
        logListContainer.innerHTML = '';

        const filteredLogs = allActivityLogEntries.filter(log => {
            if (!searchTerm) return true;
            const timestampStr = log.timestamp?.toDate?.().toLocaleString()?.toLowerCase() ?? '';
            const email = (log.adminEmail || '').toLowerCase();
            const action = (log.actionType || '').toLowerCase();
            const details = JSON.stringify(log.details || {}).toLowerCase();
            return email.includes(searchTerm) || action.includes(searchTerm) || details.includes(searchTerm) || timestampStr.includes(searchTerm);
        });

        if (filteredLogs.length === 0) {
            logListContainer.innerHTML = searchTerm ? `<p>No log entries found matching "${searchTerm}".</p>` : '<p>No activity log entries found.</p>';
        } else {
            // Assumes renderLogEntry function exists and renders a log item element
            // filteredLogs.forEach(logData => logListContainer.appendChild(renderLogEntry(logData)));
        }
        logCountElement.textContent = `(${filteredLogs.length})`;
    }


    // ========================================================================
    // --- Event Listener Initialization ---
    // ========================================================================

    // --- Profile & Settings Listeners ---
    if (profileForm) profileForm.addEventListener('submit', saveProfileData);
    if (maintenanceModeToggle) maintenanceModeToggle.addEventListener('change', (e) => saveMaintenanceModeStatus(e.target.checked));
    if (hideTikTokSectionToggle) hideTikTokSectionToggle.addEventListener('change', (e) => saveHideTikTokSectionStatus(e.target.checked));
    if (profilePicUrlInput && adminPfpPreview) {
        profilePicUrlInput.addEventListener('input', () => {
            const url = profilePicUrlInput.value.trim();
            adminPfpPreview.src = url;
            adminPfpPreview.style.display = url ? 'inline-block' : 'none';
        });
        adminPfpPreview.onerror = () => { adminPfpPreview.style.display = 'none'; };
    }

    // --- President Listeners ---
    if (presidentForm) {
        presidentForm.addEventListener('submit', savePresidentData);
        [presidentNameInput, presidentBornInput, presidentHeightInput, presidentPartyInput, presidentTermInput, presidentVpInput, presidentImageUrlInput].forEach(input => {
            if(input) input.addEventListener('input', updatePresidentPreview);
        });
    }

    // --- Shoutout Listeners ---
    addSubmitListenerOnce(addShoutoutTiktokForm, () => handleAddShoutout('tiktok', addShoutoutTiktokForm));
    addSubmitListenerOnce(addShoutoutInstagramForm, () => handleAddShoutout('instagram', addShoutoutInstagramForm));
    addSubmitListenerOnce(addShoutoutYoutubeForm, () => handleAddShoutout('youtube', addShoutoutYoutubeForm));
    if (editForm) editForm.addEventListener('submit', handleUpdateShoutout);
    if (cancelEditButton) cancelEditButton.addEventListener('click', closeEditModal);
    if (searchInputTiktok) searchInputTiktok.addEventListener('input', () => displayFilteredShoutouts('tiktok'));
    if (searchInputInstagram) searchInputInstagram.addEventListener('input', () => displayFilteredShoutouts('instagram'));
    if (searchInputYoutube) searchInputYoutube.addEventListener('input', () => displayFilteredShoutouts('youtube'));

    function attachPreviewListeners(formElement, platform, formType) {
        if (!formElement) return;
        const inputs = ['username', 'nickname', 'bio', 'profilePic', 'isVerified', 'followers', 'subscribers', 'coverPhoto'];
        inputs.forEach(name => {
            const inputElement = formElement.querySelector(`[name="${name}"]`);
            if (inputElement) {
                const eventType = (inputElement.type === 'checkbox') ? 'change' : 'input';
                inputElement.addEventListener(eventType, () => updateShoutoutPreview(formType, platform));
            }
        });
    }
    attachPreviewListeners(addShoutoutTiktokForm, 'tiktok', 'add');
    attachPreviewListeners(addShoutoutInstagramForm, 'instagram', 'add');
    attachPreviewListeners(addShoutoutYoutubeForm, 'youtube', 'add');
    if (editForm) {
        const editPreviewInputs = [editUsernameInput, editNicknameInput, editBioInput, editProfilePicInput, editIsVerifiedInput, editFollowersInput, editSubscribersInput, editCoverPhotoInput];
        editPreviewInputs.forEach(el => {
            if (el) {
                const eventType = (el.type === 'checkbox') ? 'change' : 'input';
                el.addEventListener(eventType, () => {
                    const currentPlatform = editForm.getAttribute('data-platform');
                    if (currentPlatform) updateShoutoutPreview('edit', currentPlatform);
                });
            }
        });
    }

    // --- Tech Management Listeners ---
    if (addTechItemForm) {
        addTechItemForm.addEventListener('submit', handleAddTechItem);
        attachTechPreviewListeners(addTechItemForm, 'add');
    }
    if (editTechItemForm) editTechItemForm.addEventListener('submit', handleUpdateTechItem);
    if (cancelEditTechButton) cancelEditTechButton.addEventListener('click', closeEditTechItemModal);
    if (cancelEditTechButtonSecondary) cancelEditTechButtonSecondary.addEventListener('click', closeEditTechItemModal);
    if (searchTechItemsInput) searchTechItemsInput.addEventListener('input', displayFilteredTechItems);

    // --- Useful Links Listeners ---
    if (addUsefulLinkForm) addUsefulLinkForm.addEventListener('submit', handleAddUsefulLink);
    if (editUsefulLinkForm) editUsefulLinkForm.addEventListener('submit', handleUpdateUsefulLink);
    if (cancelEditLinkButton) cancelEditLinkButton.addEventListener('click', closeEditUsefulLinkModal);
    if (cancelEditLinkButtonSecondary) cancelEditLinkButtonSecondary.addEventListener('click', closeEditUsefulLinkModal);
    if (searchInputUsefulLinks) searchInputUsefulLinks.addEventListener('input', displayFilteredUsefulLinks);

    // --- Social Links Listeners ---
    if (addSocialLinkForm) addSocialLinkForm.addEventListener('submit', handleAddSocialLink);
    if (editSocialLinkForm) editSocialLinkForm.addEventListener('submit', handleUpdateSocialLink);
    if (cancelEditSocialLinkButton) cancelEditSocialLinkButton.addEventListener('click', closeEditSocialLinkModal);
    if (cancelEditSocialLinkButtonSecondary) cancelEditSocialLinkButtonSecondary.addEventListener('click', closeEditSocialLinkModal);
    if (searchInputSocialLinks) searchInputSocialLinks.addEventListener('input', displayFilteredSocialLinks);

    // --- Disabilities Listeners ---
    if (addDisabilityForm) addDisabilityForm.addEventListener('submit', handleAddDisability);
    if (editDisabilityForm) editDisabilityForm.addEventListener('submit', handleUpdateDisability);
    if (cancelEditDisabilityButton) cancelEditDisabilityButton.addEventListener('click', closeEditDisabilityModal);
    if (cancelEditDisabilityButtonSecondary) cancelEditDisabilityButtonSecondary.addEventListener('click', closeEditDisabilityModal);
    if (searchInputDisabilities) searchInputDisabilities.addEventListener('input', displayFilteredDisabilities);

    // --- Global Modal Close Listener ---
    window.addEventListener('click', (event) => {
        if (event.target === editModal) closeEditModal();
        if (event.target === editUsefulLinkModal) closeEditUsefulLinkModal();
        if (event.target === editSocialLinkModal) closeEditSocialLinkModal();
        if (event.target === editDisabilityModal) closeEditDisabilityModal();
        if (event.target === editTechItemModal) closeEditTechItemModal();
    });

}); // End DOMContentLoaded Event Listener

// --- Google Sign-In Handler (Global Scope) ---
window.handleGoogleSignIn = async (response) => {
    console.log("Received response from Google Sign-In...");
    const authStatus = document.getElementById('auth-status');
    if (authStatus) { authStatus.textContent = 'Verifying with Google...'; authStatus.className = 'status-message'; authStatus.style.display = 'block'; }

    const credential = GoogleAuthProvider.credential(response.credential);
    try {
        await signInWithCredential(auth, credential);
        console.log("Successfully signed in with Google.");
    } catch (error) {
        console.error("Firebase Google Sign-In Error:", error);
        if (authStatus) { authStatus.textContent = `Google Login Failed: ${error.message}`; authStatus.className = 'status-message error'; }
    }
};
