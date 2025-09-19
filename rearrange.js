// rearrange.js (Corrected Version)

document.addEventListener('DOMContentLoaded', () => {
    let rearrangingEnabled = true; // Default to enabled

    try {
        // Load all settings from the single localStorage item
        const storedSettings = localStorage.getItem('websiteSettings');
        
        if (storedSettings) {
            const settings = JSON.parse(storedSettings);
            // Check if the rearranging setting is specifically 'disabled'
            if (settings.rearrangingEnabled === 'disabled') {
                rearrangingEnabled = false;
            }
        }
    } catch (error) {
        console.error("Error reading rearrangement settings, defaulting to enabled.", error);
        rearrangingEnabled = true;
    }

    // Only initialize SortableJS if the feature is enabled
    if (rearrangingEnabled) {
        const rearrangeableContainer = document.getElementById('rearrangeable-container');

        if (rearrangeableContainer) {
            console.log("Section rearranging is ENABLED.");
            new Sortable(rearrangeableContainer, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                // This function saves the new order when the user drops a section
                onEnd: function (evt) {
                    const sectionOrder = [];
                    rearrangeableContainer.querySelectorAll('[data-section-id]').forEach(section => {
                        sectionOrder.push(section.dataset.sectionId);
                    });
                    // Note: We save the order in a separate item, which is fine.
                    localStorage.setItem('sectionOrder', JSON.stringify(sectionOrder));
                }
            });
        }
    } else {
        console.log("Section rearranging is DISABLED by user setting.");
    }
});
