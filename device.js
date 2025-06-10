document.addEventListener("DOMContentLoaded", function() {
    // Function to detect OS and its version
    function detectOSAndVersion() {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let os = "Unknown OS";
        let osVersion = "";
        let ntVersion = "";

        // --- Apple Mobile Devices ---
        if (!window.MSStream) {
            if (/iPad/i.test(userAgent)) {
                os = "iPadOS";
                const osMatch = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                if (osMatch && osMatch[1]) {
                    osVersion = osMatch[1].replace(/_/g, '.');
                }
            } else if (/iPhone|iPod/.test(userAgent)) {
                os = "iOS";
                const osMatch = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                if (osMatch && osMatch[1]) {
                    osVersion = osMatch[1].replace(/_/g, '.');
                }
            }
        }

        // --- Android ---
        if (os === "Unknown OS" && /android/i.test(userAgent)) {
            os = "Android";
            const androidMatch = userAgent.match(/Android (\d+(\.\d+)*)/i);
            if (androidMatch && androidMatch[1]) {
                osVersion = androidMatch[1];
            }
        }
        // --- macOS ---
        else if (os === "Unknown OS" && /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
            os = "macOS";
            const macOSMatch = userAgent.match(/Mac OS X (\d+([_.]\d+)*)/i);
            if (macOSMatch && macOSMatch[1]) {
                osVersion = macOSMatch[1].replace(/_/g, '.');
            }
        }
        // --- Windows ---
        else if (os === "Unknown OS" && /Win/.test(userAgent)) {
            os = "Windows";
            const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/i);
            if (windowsMatch && windowsMatch[1]) {
                ntVersion = windowsMatch[1];
                switch (ntVersion) {
                    case "10.0":
                        osVersion = "10 / 11";
                        break;
                    case "6.3":
                        osVersion = "8.1";
                        break;
                    case "6.2":
                        osVersion = "8";
                        break;
                    case "6.1":
                        osVersion = "7";
                        break;
                    case "6.0":
                        osVersion = "Vista";
                        break;
                    case "5.1": case "5.2":
                        osVersion = "XP";
                        break;
                    default:
                        osVersion = "NT " + ntVersion;
                        break;
                }
            } else if (userAgent.indexOf("Windows Phone") !== -1) {
                os = "Windows Phone";
                const wpMatch = userAgent.match(/Windows Phone (\d+\.\d+)/i);
                if (wpMatch && wpMatch[1]) {
                    osVersion = wpMatch[1];
                }
            }
        }
        // --- Linux ---
        else if (os === "Unknown OS" && /Linux/.test(userAgent)) {
            os = "Linux";
        }

        let fullOsInfo = os;
        if (osVersion) {
            fullOsInfo += " " + osVersion;
        }

        // Use User-Agent Client Hints for more precise OS version
        if (navigator.userAgentData && (os !== "Unknown OS" && os !== "Windows Phone")) {
            navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion"])
                .then(ua => {
                    let clientHintOS = os;
                    let clientHintOSVersion = osVersion;

                    if (ua.platformVersion) {
                        clientHintOSVersion = ua.platformVersion;
                        const versionParts = ua.platformVersion.split('.');
                        
                        // Handle Windows 10 vs 11
                        if (clientHintOS === "Windows") {
                            const buildNumber = parseInt(versionParts[2], 10);
                            if (buildNumber >= 22000) {
                                clientHintOSVersion = "11 (Build " + versionParts.slice(2).join('.') + ")";
                            } else {
                                clientHintOSVersion = "10 (Build " + versionParts.slice(2).join('.') + ")";
                            }
                        } 
                        // Translate macOS Darwin version to marketing version
                        else if (clientHintOS === "macOS") {
                            const majorPlatformVersion = parseInt(versionParts[0], 10);
                            let macosVersionName = `(Darwin ${ua.platformVersion})`; // Fallback name

                            switch (majorPlatformVersion) {
                                // *** ADDED per your request ***
                                case 26: macosVersionName = "26.0 (Tahoe)"; break;
                                case 24: macosVersionName = "15 (Sequoia)"; break;
                                case 23: macosVersionName = "14 (Sonoma)"; break;
                                case 22: macosVersionName = "13 (Ventura)"; break;
                                case 21: macosVersionName = "12 (Monterey)"; break;
                                case 20: macosVersionName = "11 (Big Sur)"; break;
                                case 19: macosVersionName = "10.15 (Catalina)"; break;
                                case 18: macosVersionName = "10.14 (Mojave)"; break;
                                case 17: macosVersionName = "10.13 (High Sierra)"; break;
                                case 16: macosVersionName = "10.12 (Sierra)"; break;
                                default:
                                    // Handle other future or very old versions
                                    if (majorPlatformVersion > 26) {
                                        macosVersionName = `${majorPlatformVersion - 10} (Future Release)`;
                                    }
                                    break;
                            }
                            clientHintOSVersion = macosVersionName;
                        }
                    }

                    fullOsInfo = clientHintOS;
                    if (clientHintOSVersion) {
                        fullOsInfo += " " + clientHintOSVersion;
                    }

                    document.getElementById("os-info").textContent = fullOsInfo;
                })
                .catch(error => {
                    console.warn("Could not retrieve detailed OS version via Client Hints:", error);
                    document.getElementById("os-info").textContent = fullOsInfo;
                });
        } else {
            document.getElementById("os-info").textContent = fullOsInfo;
        }
    }

    // Function to detect general device type
    function detectDevice() {
        let userAgent = navigator.userAgent;

        if (/iPad/i.test(userAgent)) {
            return "iPad";
        } else if (/iPhone/i.test(userAgent)) {
            return "iPhone";
        } else if (/iPod/i.test(userAgent)) {
            return "iPod";
        } else if (/Macintosh/i.test(userAgent)) {
            return "Mac";
        } else if (/Android/i.test(userAgent)) {
            return "Android Device";
        } else if (/Windows/i.test(userAgent)) {
            return "Windows Device";
        } else if (/Linux/.test(userAgent)) {
            return "Linux Device";
        } else {
            return "Unknown Device";
        }
    }

    // Function to detect more specific device model
    function getDetailedDeviceModel() {
        if (navigator.userAgentData) {
            navigator.userAgentData.getHighEntropyValues(["model"])
                .then(ua => {
                    const model = ua.model;
                    if (model && model !== "Unknown") {
                        document.getElementById("model-info").textContent = model;
                    } else {
                        console.log("Client Hints model unknown, falling back to user agent parsing.");
                        document.getElementById("model-info").textContent = parseModelFromUserAgent(navigator.userAgent);
                    }
                })
                .catch(error => {
                    console.warn("Could not retrieve device model via Client Hints:", error);
                    document.getElementById("model-info").textContent = parseModelFromUserAgent(navigator.userAgent);
                });
        } else {
            document.getElementById("model-info").textContent = parseModelFromUserAgent(navigator.userAgent);
        }
    }

    // Helper function to parse model from User-Agent string
    function parseModelFromUserAgent(userAgent) {
        let deviceModel = "Not detected (UA)";

        const androidMatch = userAgent.match(/Android[^;]+; ([^)]+)(?: Build)?\//);
        if (androidMatch && androidMatch[1]) {
            let modelCandidate = androidMatch[1].trim();
            if (modelCandidate.includes("Build/")) {
                modelCandidate = modelCandidate.substring(0, modelCandidate.indexOf("Build/")).trim();
            }
            if (modelCandidate.includes(";")) {
                modelCandidate = modelCandidate.split(';').pop().trim();
            }
            deviceModel = modelCandidate;
        } else if (/iPad/.test(userAgent)) {
            deviceModel = "iPad (specific model unknown)";
        } else if (/iPhone/.test(userAgent)) {
            deviceModel = "iPhone (specific model unknown)";
        } else if (/Windows Phone/.test(userAgent)) {
            const wpModelMatch = userAgent.match(/Windows Phone (?:OS )?[\d.]+\d?; ([^;)]+)/);
            if (wpModelMatch && wpModelMatch[1]) {
                deviceModel = wpModelMatch[1].trim();
            } else {
                deviceModel = "Windows Phone (specific model unknown)";
            }
        } else if (/Macintosh|MacIntel/.test(userAgent)) {
            deviceModel = "Mac (specific model unknown)";
        } else if (/Linux/.test(userAgent)) {
            deviceModel = "Linux Device (specific model unknown)";
        } else {
            deviceModel = "Unknown Device (UA fallback)";
        }

        return deviceModel;
    }


    // Apply detections to DOM elements when the page loads
    document.getElementById("device-info").textContent = detectDevice();
    detectOSAndVersion();
    getDetailedDeviceModel();
});
