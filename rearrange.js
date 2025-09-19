// In rearrange.js

document.addEventListener('DOMContentLoaded', () => {
    // Check if rearranging is enabled in localStorage. Default to 'true' if not set.
    const rearrangingEnabled = localStorage.getItem('rearrangingEnabled') !== 'false';

    // Only initialize SortableJS if the feature is enabled
    if (rearrangingEnabled) {
        const rearrangeableContainer = document.getElementById('rearrangeable-container');

        if (rearrangeableContainer) {
            new Sortable(rearrangeableContainer, {
                animation: 150,
                ghostClass: 'sortable-ghost',
                // This function saves the new order when the user drops a section
                onEnd: function (evt) {
                    const sectionOrder = [];
                    rearrangeableContainer.querySelectorAll('[data-section-id]').forEach(section => {
                        sectionOrder.push(section.dataset.sectionId);
                    });
                    localStorage.setItem('sectionOrder', JSON.stringify(sectionOrder));
                }
            });
        }
    } else {
        console.log("Section rearranging is disabled by user setting.");
    }
});
