document.addEventListener("DOMContentLoaded", function () {
    function detectOSAndVersion() {
        const ua = navigator.userAgent;
        let os = "Unknown OS";
        let rawVersion = "";
        let version = "";

        const addVersion = (base, offset) => {
            const major = parseInt(base.split('.')[0], 10);
            const rest = base.split('.').slice(1).join('.');
            return (major + offset) + (rest ? `.${rest}` : '');
        };

        // iOS and iPadOS
        if (/iPhone|iPod/.test(ua)) {
            os = "iOS";
            const match = ua.match(/OS (\d+[_\d]*)/i);
            if (match) {
                rawVersion = match[1].replace(/_/g, '.');
                // Safari spoof offset
                version = addVersion(rawVersion, 7);
            }
        } else if (/iPad/.test(ua)) {
            os = "iPadOS";
            const match = ua.match(/OS (\d+[_\d]*)/i);
            if (match) {
                rawVersion = match[1].replace(/_/g, '.');
                version = addVersion(rawVersion, 7);
            }
        }

        // macOS
        else if (/Macintosh/.test(ua)) {
            os = "macOS";
            const match = ua.match(/Mac OS X (\d+[_\d]*)/i);
            if (match) {
                rawVersion = match[1].replace(/_/g, '.');
                version = addVersion(rawVersion, 4); // Safari fakes macOS 15 as "19"
            }
        }

        // Android
        else if (/Android/.test(ua)) {
            os = "Android";
            const match = ua.match(/Android (\d+(\.\d+)?)/i);
            if (match) version = match[1];
        }

        // Windows
        else if (/Windows NT/.test(ua)) {
            os = "Windows";
            const match = ua.match(/Windows NT (\d+\.\d+)/);
            if (match) {
                const nt = match[1];
                const map = {
                    "10.0": "10 / 11",
                    "6.3": "8.1",
                    "6.2": "8",
                    "6.1": "7",
                    "6.0": "Vista",
                    "5.1": "XP"
                };
                version = map[nt] || `NT ${nt}`;
            }
        }

        // Linux
        else if (/Linux/.test(ua)) {
            os = "Linux";
        }

        const full = version ? `${os} ${version}` : os;
        document.getElementById("os-info").textContent = full;
    }

    function detectDevice() {
        const ua = navigator.userAgent;
        if (/iPhone/.test(ua)) return "iPhone";
        if (/iPad/.test(ua)) return "iPad";
        if (/Macintosh/.test(ua)) return "Mac";
        if (/Android/.test(ua)) return "Android Device";
        if (/Windows/.test(ua)) return "Windows Device";
        return "Unknown Device";
    }

    function detectModel() {
        const fallback = () => {
            const ua = navigator.userAgent;
            if (/iPhone/.test(ua)) return "iPhone (model unknown)";
            if (/iPad/.test(ua)) return "iPad (model unknown)";
            if (/Macintosh/.test(ua)) return "Mac (model unknown)";
            if (/Android/.test(ua)) {
                const match = ua.match(/Android.*?;\s*([^)]+?)\s*(Build|$)/);
                if (match) return match[1].trim();
                return "Android Device (model unknown)";
            }
            return "Unknown Device";
        };

        if (navigator.userAgentData && navigator.userAgentData.getHighEntropyValues) {
            navigator.userAgentData.getHighEntropyValues(["model"]).then(data => {
                document.getElementById("model-info").textContent =
                    data.model || fallback();
            }).catch(() => {
                document.getElementById("model-info").textContent = fallback();
            });
        } else {
            document.getElementById("model-info").textContent = fallback();
        }
    }

    // Run detections
    document.getElementById("device-info").textContent = detectDevice();
    detectOSAndVersion();
    detectModel();
});
