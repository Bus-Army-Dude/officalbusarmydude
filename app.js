const shiftForm = document.getElementById('shiftForm');
const shiftsContainer = document.getElementById('shiftsContainer');

shiftForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const location = document.getElementById('location').value;

  await db.collection('shifts').add({
    date,
    start,
    end,
    location,
    timestamp: firebase.firestore.FieldValue.serverTimestamp()
  });

  shiftForm.reset();
});

function loadShifts() {
  db.collection("shifts").orderBy("timestamp", "desc").onSnapshot(snapshot => {
    shiftsContainer.innerHTML = '';
    snapshot.forEach(doc => {
      const shift = doc.data();
      const div = document.createElement('div');
      div.innerHTML = `<strong>${shift.date}</strong><br>${shift.start} - ${shift.end} @ ${shift.location}`;
      shiftsContainer.appendChild(div);
    });
  });
}

loadShifts();
