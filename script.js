document.addEventListener("DOMContentLoaded", function() {
    // Get the dropdown and the div that contains the textarea
    const experienceSelect = document.getElementById('experience');
    const experienceDetails = document.getElementById('experience-details');

    // Initially hide the experience explanation section
    experienceDetails.style.display = 'none';

    // Add event listener to show/hide the experience explanation field
    experienceSelect.addEventListener('change', function() {
        if (experienceSelect.value === 'yes') {
            // Show the textarea when "Yes" is selected
            experienceDetails.style.display = 'block';
        } else {
            // Hide the textarea when "No" is selected
            experienceDetails.style.display = 'none';
        }
    });
});


    // Age validation: Ensure the user is 13 or older
    ageInput.addEventListener('input', function() {
        const ageValue = ageInput.value;
        const ageError = document.getElementById('ageError');

        if (ageValue < 13) {
            ageInput.setCustomValidity("You don't meet the age requirements to work here.");
            if (!ageError) {
                const errorDiv = document.createElement('div');
                errorDiv.id = 'ageError';
                errorDiv.style.color = 'red';
                errorDiv.innerText = "You don't meet the age requirements to work here.";
                ageInput.insertAdjacentElement('afterend', errorDiv);
            }
        } else {
            ageInput.setCustomValidity("");
            if (ageError) {
                ageError.remove();
            }
        }
    });

    // Form submission validation
    form.addEventListener('submit', function(event) {
        const requirementsSelect = document.getElementById('requirements');
        if (requirementsSelect.value === "") {
            event.preventDefault();
            alert("Please confirm you understand the application requirements.");
        }
    });
});
