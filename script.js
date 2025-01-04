document.addEventListener("DOMContentLoaded", function() {
    // Handle experience explanation section
    const experienceSelect = document.getElementById('experience');
    const experienceDetails = document.getElementById('experienceDetails');

    experienceSelect.addEventListener('change', function() {
        if (experienceSelect.value === "Yes") {
            experienceDetails.style.display = 'block';
        } else {
            experienceDetails.style.display = 'none';
        }
    });

    // Age validation: Ensure the user is 13 or older
    const ageInput = document.getElementById('age');
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

    // Form submission validation (Optional: for better UX, can be customized)
    const form = document.querySelector('form');
    form.addEventListener('submit', function(event) {
        // Example of additional custom validation if needed
        const radioButtons = document.querySelectorAll('input[name="requirements"]');
        let isValid = false;

        radioButtons.forEach(button => {
            if (button.checked) {
                isValid = true;
            }
        });

        if (!isValid) {
            event.preventDefault();
            alert("Please confirm you understand the application requirements.");
        }
    });
});
