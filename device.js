document.addEventListener("DOMContentLoaded", function() {
    // Function to detect OS and its version
    function detectOSAndVersion() {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let os = "Unknown OS";
        let osVersion = "";
        let ntVersion = "";

        // --- Apple Mobile Devices ---
        if (!window.MSStream) {
            // iPadOS detection must come before macOS due to User-Agent string overlap
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
        // Check if OS is still unknown before attempting Android detection
        if (os === "Unknown OS" && /android/i.test(userAgent)) {
            os = "Android";
            const androidMatch = userAgent.match(/Android (\d+(\.\d+)*)/i);
            if (androidMatch && androidMatch[1]) {
                osVersion = androidMatch[1];
            }
        }
        // --- macOS ---
        // Check if OS is still unknown before attempting macOS detection
        else if (os === "Unknown OS" && /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
            os = "macOS";
            const macOSMatch = userAgent.match(/Mac OS X (\d+([_.]\d+)*)/i);
            if (macOSMatch && macOSMatch[1]) {
                osVersion = macOSMatch[1].replace(/_/g, '.');
            }
        }
        // --- Windows ---
        // Check if OS is still unknown before attempting Windows detection
        else if (os === "Unknown OS" && /Win/.test(userAgent)) {
            os = "Windows";
            const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/i);
            if (windowsMatch && windowsMatch[1]) {
                ntVersion = windowsMatch[1];
                switch (ntVersion) {
                    case "10.0":
                        osVersion = "10 / 11"; // Windows 10 and 11 both report NT 10.0
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
                    case "5.1":
                    case "5.2": // Windows XP 64-bit
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
        // Check if OS is still unknown before attempting Linux detection
        else if (os === "Unknown OS" && /Linux/.test(userAgent)) {
            os = "Linux";
            // Linux versions are not reliably found in user agents without distro-specific parsing
            // For general "Linux" detection, we usually don't get a version.
        }

        let fullOsInfo = os;
        if (osVersion) {
            fullOsInfo += " " + osVersion;
        }

        // Use User-Agent Client Hints if available for more precise OS version (especially Windows 10 vs 11)
        if (navigator.userAgentData && (os !== "Unknown OS" && os !== "Windows Phone")) {
            navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion"])
                .then(ua => {
                    let clientHintOS = os;
                    let clientHintOSVersion = osVersion;

                    if (ua.platformVersion) {
                        // Start by using the full, accurate version from Client Hints
                        clientHintOSVersion = ua.platformVersion;
                        const versionParts = ua.platformVersion.split('.');

                        // Special handling for Windows to differentiate 10 vs 11
                        if (clientHintOS === "Windows") {
                            const buildNumber = parseInt(versionParts[2], 10);
                            if (buildNumber >= 22000) {
                                clientHintOSVersion = "11 (Build " + versionParts.slice(2).join('.') + ")";
                            } else {
                                clientHintOSVersion = "10 (Build " + versionParts.slice(2).join('.') + ")";
                            }
                        }
                        // ***FIXED***: Removed the 'else if' block that was incorrectly simplifying
                        // the version for macOS, iOS, iPadOS, and Android.
                        // The full 'platformVersion' will now be used by default for these OSes.
                    }

                    fullOsInfo = clientHintOS;
                    if (clientHintOSVersion) {
                        fullOsInfo += " " + clientHintOSVersion;
                    }

                    document.getElementById("os-info").textContent = fullOsInfo;
                })
                .catch(error => {
                    console.warn("Could not retrieve detailed OS version via Client Hints:", error);
                    // Fallback to user agent parsed info if Client Hints fail
                    document.getElementById("os-info").textContent = fullOsInfo;
                });
        } else {
            // If User-Agent Client Hints are not supported, use initial user agent parsed info
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
