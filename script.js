// Age restriction logic
function validateAge() {
    var age = document.getElementById('age').value;
    if (age < 13) {
        alert("You don't meet the age requirements to work here.");
        return false;
    }
    return true;
}
