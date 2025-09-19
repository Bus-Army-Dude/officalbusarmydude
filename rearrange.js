// rearrange.js

document.addEventListener('DOMContentLoaded', () => {
    const rearrangeableContainer = document.getElementById('rearrangeable-container');

    if (rearrangeableContainer) {
        new Sortable(rearrangeableContainer, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: function (evt) {
                const sectionOrder = [];
                rearrangeableContainer.querySelectorAll('[data-section-id]').forEach(section => {
                    sectionOrder.push(section.dataset.sectionId);
                });
                localStorage.setItem('sectionOrder', JSON.stringify(sectionOrder));
            }
        });
    }
});
