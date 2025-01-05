document.addEventListener("DOMContentLoaded", function() {
    const experienceSelect = document.getElementById('experience');
    const experienceDetails = document.getElementById('experience-details');
    const ageInput = document.getElementById('age');
    const form = document.getElementById('apply-form');

    // Event listener for the "Do you have experience?" question
    experienceSelect.addEventListener('change', function() {
        if (experienceSelect.value === 'yes') {
            experienceDetails.style.display = 'block';
        } else {
            experienceDetails.style.display = 'none';
        }
    });

    // Form submission validation
    form.addEventListener('submit', function(event) {
        const age = parseInt(ageInput.value, 10);
        if (age < 13) {
            event.preventDefault(); // Prevent form submission
            alert("You must be at least 13 years old to apply.");
        }
    });
});
