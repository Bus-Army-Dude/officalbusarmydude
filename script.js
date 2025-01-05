document.addEventListener("DOMContentLoaded", function() {
    const experienceSelect = document.getElementById('experience');
    const experienceDetails = document.getElementById('experience-details');

    // Initial check to ensure the field is hidden if not selected as "Yes"
    if (experienceSelect.value !== 'yes') {
        experienceDetails.style.display = 'none';
    }

    // Event listener for the "Do you have experience?" question
    experienceSelect.addEventListener('change', function() {
        if (experienceSelect.value === 'yes') {
            experienceDetails.style.display = 'block';  // Show explanation box
        } else {
            experienceDetails.style.display = 'none';   // Hide explanation box
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
