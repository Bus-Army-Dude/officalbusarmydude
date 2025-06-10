document.addEventListener("DOMContentLoaded", function() {
    // This is the main function that will be called
    function initializeDeviceDetection() {
        detectOSAndVersion();
        getDetailedDeviceModel();
    }

    // Function to get the generic device type (e.g., Mac, iPhone)
    // This is now mainly used as a fallback
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

    // This function now correctly targets the '#device-info' element
    // and prioritizes the specific model over the generic one.
    function getDetailedDeviceModel() {
        const deviceInfoElement = document.getElementById("device-info");
        if (!deviceInfoElement) {
            console.error("Device info element with id 'device-info' not found.");
            return;
        }

        const genericDeviceName = detectDevice(); // Get the generic name for fallback

        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            navigator.userAgentData.getHighEntropyValues(["model"])
                .then(ua => {
                    const specificModel = ua.model;
                    // Use the specific model if it's not empty, otherwise use the generic name
                    if (specificModel && specificModel.trim()) {
                        deviceInfoElement.textContent = specificModel;
                    } else {
                        deviceInfoElement.textContent = genericDeviceName;
                    }
                })
                .catch(error => {
                    console.warn("Could not retrieve specific device model. Falling back to generic device type.", error);
                    deviceInfoElement.textContent = genericDeviceName;
                });
        } else {
            // Fallback for browsers that don't support the API
            deviceInfoElement.textContent = genericDeviceName;
        }
    }

    // This is the OS detection function we fixed previously. It remains the same.
    function detectOSAndVersion() {
        let userAgent = navigator.userAgent || navigator.vendor || window.opera;
        let os = "Unknown OS";
        let osVersion = "";

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
        } else if (/android/i.test(userAgent)) {
            os = "Android";
            const androidMatch = userAgent.match(/Android (\d+(\.\d+)*)/i);
            if (androidMatch && androidMatch[1]) {
                osVersion = androidMatch[1];
            }
        } else if (/Macintosh|MacIntel|MacPPC|Mac68K/.test(userAgent)) {
            os = "macOS";
            const macOSMatch = userAgent.match(/Mac OS X (\d+([_.]\d+)*)/i);
            if (macOSMatch && macOSMatch[1]) {
                osVersion = macOSMatch[1].replace(/_/g, '.');
            }
        } else if (/Win/.test(userAgent)) {
            os = "Windows";
            const windowsMatch = userAgent.match(/Windows NT (\d+\.\d+)/i);
            if (windowsMatch && windowsMatch[1]) {
                const ntVersion = windowsMatch[1];
                switch (ntVersion) {
                    case "10.0": osVersion = "10 / 11"; break;
                    case "6.3": osVersion = "8.1"; break;
                    case "6.2": osVersion = "8"; break;
                    case "6.1": osVersion = "7"; break;
                    default: osVersion = "NT " + ntVersion; break;
                }
            }
        } else if (/Linux/.test(userAgent)) {
            os = "Linux";
        }

        let initialFullOsInfo = os;
        if (osVersion) {
            initialFullOsInfo += " " + osVersion;
        }

        const osInfoElement = document.getElementById("os-info");

        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion"])
                .then(ua => {
                    const clientHintOS = ua.platform || os;
                    const versionString = ua.platformVersion;

                    if (!versionString) {
                        osInfoElement.textContent = clientHintOS;
                        return;
                    }

                    if (clientHintOS === "macOS") {
                        fetch(`https://support-sp.apple.com/sp/product?edid=${versionString}`)
                            .then(response => {
                                if (!response.ok) return Promise.reject(`API response not OK: ${response.statusText}`);
                                return response.text();
                            })
                            .then(xmlText => {
                                const match = xmlText.match(/<configCode>(.*?)<\/configCode>/);
                                const finalInfo = (match && match[1]) ? `${match[1]} (${versionString})` : `macOS ${versionString}`;
                                osInfoElement.textContent = finalInfo;
                            })
                            .catch(error => {
                                console.warn("Could not fetch macOS codename, falling back to version number.", error);
                                osInfoElement.textContent = `macOS ${versionString}`;
                            });
                    } else if (clientHintOS === "Windows") {
                        const versionParts = versionString.split('.');
                        const buildNumber = parseInt(versionParts[2], 10);
                        const osName = (buildNumber >= 22000) ? "11" : "10";
                        osInfoElement.textContent = `Windows ${osName} (Build ${versionString})`;
                    } else {
                        osInfoElement.textContent = `${clientHintOS} ${versionString}`;
                    }
                })
                .catch(error => {
                    console.warn("Could not use Client Hints, falling back to User Agent.", error);
                    osInfoElement.textContent = initialFullOsInfo;
                });
        } else {
            osInfoElement.textContent = initialFullOsInfo;
        }
    }

    // Run the main detection function
    initializeDeviceDetection();
});
