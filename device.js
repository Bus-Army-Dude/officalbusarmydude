document.addEventListener("DOMContentLoaded", function () {
    function detectOSAndVersion() {
        let os = "Unknown OS";
        let osVersion = "";

        // Check for User-Agent Client Hints first
        if (navigator.userAgentData) {
            navigator.userAgentData.getHighEntropyValues(["platform", "platformVersion"])
                .then(ua => {
                    os = ua.platform;
                    let versionParts = ua.platformVersion.split('.');
                    osVersion = versionParts.slice(0, 2).join('.');

                    if (os === "Windows") {
                        const buildNumber = parseInt(versionParts[2], 10);
                        if (buildNumber >= 22000) {
                            osVersion = `11 (Build ${buildNumber})`;
                        } else {
                            osVersion = `10 (Build ${buildNumber})`;
                        }
                    }

                    document.getElementById("os-info").textContent = `${os} ${osVersion}`;
                })
                .catch(() => {
                    document.getElementById("os-info").textContent = "OS Info Unavailable";
                });
        } else {
            // Fallback to old User-Agent sniffing
            let userAgent = navigator.userAgent || navigator.vendor || window.opera;
            let ntVersion = "";

            if (!window.MSStream) {
                if (/iPad/i.test(userAgent)) {
                    os = "iPadOS";
                    const match = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                    if (match && match[1]) osVersion = match[1].replace(/_/g, '.');
                } else if (/iPhone|iPod/.test(userAgent)) {
                    os = "iOS";
                    const match = userAgent.match(/OS (\d+([_.]\d+)*)/i);
                    if (match && match[1]) osVersion = match[1].replace(/_/g, '.');
                }
            } else if (/android/i.test(userAgent)) {
                os = "Android";
                const match = userAgent.match(/Android (\d+(\.\d+)*)/i);
                if (match && match[1]) osVersion = match[1];
            } else if (/Macintosh|MacIntel/.test(userAgent)) {
                os = "macOS";
                const match = userAgent.match(/Mac OS X (\d+([_.]\d+)*)/i);
                if (match && match[1]) osVersion = match[1].replace(/_/g, '.');
            } else if (/Win/.test(userAgent)) {
                os = "Windows";
                const match = userAgent.match(/Windows NT (\d+\.\d+)/i);
                if (match && match[1]) {
                    ntVersion = match[1];
                    switch (ntVersion) {
                        case "10.0": osVersion = "10 / 11"; break;
                        case "6.3": osVersion = "8.1"; break;
                        case "6.2": osVersion = "8"; break;
                        case "6.1": osVersion = "7"; break;
                        case "6.0": osVersion = "Vista"; break;
                        case "5.1":
                        case "5.2": osVersion = "XP"; break;
                        default: osVersion = "NT " + ntVersion; break;
                    }
                }
            } else if (/Linux/.test(userAgent)) {
                os = "Linux";
            }

            document.getElementById("os-info").textContent = `${os}${osVersion ? " " + osVersion : ""}`;
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
        if (navigator.userAgentData) {
            navigator.userAgentData.getHighEntropyValues(["model"])
                .then(ua => {
                    const model = ua.model;
                    if (model && model !== "Unknown") {
                        document.getElementById("model-info").textContent = model;
                    } else {
                        document.getElementById("model-info").textContent = parseModelFromUserAgent(navigator.userAgent);
                    }
                })
                .catch(() => {
                    document.getElementById("model-info").textContent = parseModelFromUserAgent(navigator.userAgent);
                });
        } else {
            document.getElementById("model-info").textContent = parseModelFromUserAgent(navigator.userAgent);
        }
    }

    function parseModelFromUserAgent(userAgent) {
        let model = "Not detected (UA)";
        const androidMatch = userAgent.match(/Android[^;]+; ([^)]+)(?: Build)?\//);
        if (androidMatch && androidMatch[1]) {
            model = androidMatch[1].trim().split(';').pop().replace("Build", "").trim();
        } else if (/iPad/.test(userAgent)) {
            model = "iPad (specific model unknown)";
        } else if (/iPhone/.test(userAgent)) {
            model = "iPhone (specific model unknown)";
        } else if (/Windows Phone/.test(userAgent)) {
            const match = userAgent.match(/Windows Phone (?:OS )?[\d.]+\d?; ([^;)]+)/);
            model = match && match[1] ? match[1].trim() : "Windows Phone (specific model unknown)";
        } else if (/Macintosh|MacIntel/.test(userAgent)) {
            model = "Mac (specific model unknown)";
        } else if (/Linux/.test(userAgent)) {
            model = "Linux Device (specific model unknown)";
        } else {
            model = "Unknown Device (UA fallback)";
        }
        return model;
    }

    // Run on page load
    document.getElementById("device-info").textContent = detectDevice();
    detectOSAndVersion();
    getDetailedDeviceModel();
});
