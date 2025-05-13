import { collection, addDoc, serverTimestamp, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";

const shiftForm = document.getElementById('shiftForm');
const shiftsContainer = document.getElementById('shiftsContainer');

shiftForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const date = document.getElementById('date').value;
  const start = document.getElementById('start').value;
  const end = document.getElementById('end').value;
  const location = document.getElementById('location').value;

  try {
    await addDoc(collection(window.db, "shifts"), {
      date,
      start,
      end,
      location,
      timestamp: serverTimestamp()
    });
    shiftForm.reset();
  } catch (err) {
    console.error("🔥 Error adding doc: ", err);
  }
});

const q = query(collection(window.db, "shifts"), orderBy("timestamp", "desc"));

onSnapshot(q, (snapshot) => {
  shiftsContainer.innerHTML = '';
  snapshot.forEach(doc => {
    const shift = doc.data();
    const div = document.createElement('div');
    div.innerHTML = `<strong>${shift.date}</strong><br>${shift.start} - ${shift.end} @ ${shift.location}`;
    shiftsContainer.appendChild(div);
  });
});
