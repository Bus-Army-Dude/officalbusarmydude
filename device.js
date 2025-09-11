document.addEventListener("DOMContentLoaded", function() {
    // Function to detect OS and its version
    function detectOSAndVersion() {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let os = "Unknown OS";
        let osVersion = "";

        // --- Apple Mobile Devices ---
        if (!window.MSStream) {
            // iPadOS detection must come before macOS due to User-Agent string overlap
            if (/iPad/i.test(userAgent)) {
                os = "iPadOS";
                if (navigator.userAgentData) {
                    navigator.userAgentData.getHighEntropyValues(["platformVersion"])
                        .then(ua => {
                            if (ua.platformVersion) {
                                const versionParts = ua.platformVersion.split('.');
                                osVersion = versionParts.slice(0, 2).join('.');
                                updateOSInfo(os, osVersion);
                            }
                        })
                        .catch(() => {
                            const osMatch = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                            if (osMatch && osMatch[1]) {
                                osVersion = osMatch[1].replace(/_/g, '.');
                                updateOSInfo(os, osVersion);
                            }
                        });
                } else {
                    const osMatch = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                    if (osMatch && osMatch[1]) {
                        osVersion = osMatch[1].replace(/_/g, '.');
                        updateOSInfo(os, osVersion);
                    }
                }
            } else if (/iPhone|iPod/.test(userAgent)) {
                os = "iOS";
                if (navigator.userAgentData) {
                    navigator.userAgentData.getHighEntropyValues(["platformVersion"])
                        .then(ua => {
                            if (ua.platformVersion) {
                                const versionParts = ua.platformVersion.split('.');
                                osVersion = versionParts.slice(0, 2).join('.');
                                updateOSInfo(os, osVersion);
                            }
                        })
                        .catch(() => {
                            const osMatch = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                            if (osMatch && osMatch[1]) {
                                osVersion = osMatch[1].replace(/_/g, '.');
                                updateOSInfo(os, osVersion);
                            }
                        });
                } else {
                    const osMatch = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                    if (osMatch && osMatch[1]) {
                        osVersion = osMatch[1].replace(/_/g, '.');
                        updateOSInfo(os, osVersion);
                    }
                }
            }
        }

        // --- Android ---
        if (os === "Unknown OS" && /android/i.test(userAgent)) {
            os = "Android";
            if (navigator.userAgentData) {
                navigator.userAgentData.getHighEntropyValues(["platformVersion"])
                    .then(ua => {
                        if (ua.platformVersion) {
                            osVersion = ua.platformVersion.split('.').slice(0, 2).join('.');
                            updateOSInfo(os, osVersion);
                        }
                    })
                    .catch(() => {
                        const androidMatch = userAgent.match(/Android (\d+(\.\d+)*)/i);
                        if (androidMatch && androidMatch[1]) {
                            osVersion = androidMatch[1];
                            updateOSInfo(os, osVersion);
                        }
                    });
            } else {
                const androidMatch = userAgent.match(/Android (\d+(\.\d+)*)/i);
                if (androidMatch && androidMatch[1]) {
                    osVersion = androidMatch[1];
                    updateOSInfo(os, osVersion);
                }
            }
        }
        // --- macOS ---
        else if (os === "Unknown OS" && /Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
            os = "macOS";
            if (navigator.userAgentData) {
                navigator.userAgentData.getHighEntropyValues(["platformVersion"])
                    .then(ua => {
                        if (ua.platformVersion) {
                            const versionParts = ua.platformVersion.split('.');
                            osVersion = versionParts.slice(0, 2).join('.');
                            updateOSInfo(os, osVersion);
                        }
                    })
                    .catch(() => {
                        const macOSMatch = userAgent.match(/Mac OS X (\d+([_.]\d+)*)/i);
                        if (macOSMatch && macOSMatch[1]) {
                            osVersion = macOSMatch[1].replace(/_/g, '.');
                            updateOSInfo(os, osVersion);
                        }
                    });
            } else {
                const macOSMatch = userAgent.match(/Mac OS X (\d+([_.]\d+)*)/i);
                if (macOSMatch && macOSMatch[1]) {
                    osVersion = macOSMatch[1].replace(/_/g, '.');
                    updateOSInfo(os, osVersion);
                }
            }
        }
        // --- Windows ---
        else if (os === "Unknown OS" && /Win/.test(userAgent)) {
            os = "Windows";
            if (navigator.userAgentData) {
                navigator.userAgentData.getHighEntropyValues(["platformVersion"])
                    .then(ua => {
                        if (ua.platformVersion) {
                            const versionParts = ua.platformVersion.split('.');
                            const buildNumber = parseInt(versionParts[2], 10);
                            osVersion = (buildNumber >= 22000) ? "11" : "10";
                            updateOSInfo(os, osVersion);
                        }
                    })
                    .catch(() => {
                        handleLegacyWindowsVersion();
                    });
            } else {
                handleLegacyWindowsVersion();
            }
        }
        // --- Linux ---
        else if (os === "Unknown OS" && /Linux/.test(userAgent)) {
            os = "Linux";
            updateOSInfo(os, osVersion);
        }

        // Initial display if not already handled by async calls
        if (os === "Unknown OS") {
            updateOSInfo(os, osVersion);
        }
    }

    function handleLegacyWindowsVersion() {
        const userAgent = navigator.userAgent;
        const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/i);
        let osVersion = "";
        
        if (windowsMatch && windowsMatch[1]) {
            const ntVersion = windowsMatch[1];
            switch (ntVersion) {
                case "10.0": osVersion = "10 / 11"; break;
                case "6.3": osVersion = "8.1"; break;
                case "6.2": osVersion = "8"; break;
                case "6.1": osVersion = "7"; break;
                case "6.0": osVersion = "Vista"; break;
                case "5.1": case "5.2": osVersion = "XP"; break;
                default: osVersion = "NT " + ntVersion;
            }
        }
        updateOSInfo("Windows", osVersion);
    }

    function updateOSInfo(os, version) {
        // FIX: Target the inner span to avoid deleting the label
        const osInfoElement = document.querySelector("#os-info .version-value");
        if (osInfoElement) {
            osInfoElement.textContent = version ? `${os} ${version}` : os;
        }
    }

    function detectDevice() {
        let userAgent = navigator.userAgent;
        if (/iPad/i.test(userAgent)) return "iPad";
        if (/iPhone/i.test(userAgent)) return "iPhone";
        if (/iPod/i.test(userAgent)) return "iPod";
        if (/Macintosh/i.test(userAgent)) return "Mac";
        if (/Android/i.test(userAgent)) return "Android Device";
        if (/Windows/i.test(userAgent)) return "Windows Device";
        if (/Linux/.test(userAgent)) return "Linux Device";
        return "Unknown Device";
    }

    function getDetailedDeviceModel() {
        const deviceInfoElement = document.querySelector("#device-info .version-value");
        if (!deviceInfoElement) return; // Exit if element not found

        if (navigator.userAgentData) {
            navigator.userAgentData.getHighEntropyValues(["model"])
                .then(ua => {
                    const model = ua.model;
                    if (model && model !== "Unknown") {
                        deviceInfoElement.textContent = model;
                    } else {
                        deviceInfoElement.textContent = parseModelFromUserAgent(navigator.userAgent);
                    }
                })
                .catch(error => {
                    console.warn("Could not retrieve device model via Client Hints:", error);
                    deviceInfoElement.textContent = parseModelFromUserAgent(navigator.userAgent);
                });
        } else {
            deviceInfoElement.textContent = parseModelFromUserAgent(navigator.userAgent);
        }
    }

    function parseModelFromUserAgent(userAgent) {
        if (/iPad/.test(userAgent)) return "iPad";
        if (/iPhone/.test(userAgent)) return "iPhone";
        if (/iPod/.test(userAgent)) return "iPod";
        if (/Android/.test(userAgent)) {
            const match = userAgent.match(/Android.*?;\s*(.*?)\s*Build\//);
            return match ? match[1].trim() : "Android Device";
        }
        if (/Windows Phone/.test(userAgent)) {
            const match = userAgent.match(/Windows Phone (?:OS )?[\d.]+\d?; ([^;)]+)/);
            return match ? match[1].trim() : "Windows Phone";
        }
        if (/Macintosh|MacIntel/.test(userAgent)) return "Mac";
        if (/Linux/.test(userAgent)) return "Linux Device";
        return "Unknown Device";
    }

    // Initialize everything when the page loads
    const initialDeviceElement = document.querySelector("#device-info .version-value");
    if (initialDeviceElement) {
        initialDeviceElement.textContent = detectDevice();
    }
    detectOSAndVersion();
    getDetailedDeviceModel();
});
