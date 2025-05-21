const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");

// Modal elements
const eventModal = document.getElementById("eventModal");
const closeModalButton = document.querySelector(".close-button");
const saveEventButton = document.getElementById("saveEventButton");
const cancelEventButton = document.getElementById("cancelEventButton");
const eventTimeInput = document.getElementById("eventTime");
const eventDescInput = document.getElementById("eventDesc");

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let currentlySelectedDayKey = null; // To store the key of the day being edited

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

function openModal(dayKey) {
  currentlySelectedDayKey = dayKey;
  eventModal.style.display = "block";
  eventTimeInput.value = ""; // Clear previous inputs
  eventDescInput.value = "";
  eventTimeInput.focus();
}

function closeModal() {
  eventModal.style.display = "none";
  currentlySelectedDayKey = null;
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = `${year}-${month}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
  const totalDays = lastDayOfMonth.getDate();

  const monthName = date.toLocaleString("default", { month: "long" });
  monthYearDisplay.textContent = `${monthName} ${year}`;
  calendarGrid.innerHTML = "";

  for (let i = 0; i < startDay; i++) {
    calendarGrid.innerHTML += `<div class="empty"></div>`;
  }

  for (let day = 1; day <= totalDays; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day-cell");
    const dayKey = `${monthKey}-${day}`;

    const today = new Date();
    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    ) {
      dayDiv.classList.add("current-day");
    }

    dayDiv.innerHTML = `<span>${day}</span><div class="event-list"></div>`;
    const eventListDiv = dayDiv.querySelector(".event-list");

    if (events[dayKey]) {
      events[dayKey].forEach(event => {
        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        eventEl.textContent = `${event.time} - ${event.desc}`;
        // TODO: Add click listener to eventEl to edit/delete
        eventListDiv.appendChild(eventEl);
      });
    }

    dayDiv.addEventListener("click", () => {
      openModal(dayKey); // Open modal instead of prompt
    });

    calendarGrid.appendChild(dayDiv);
  }
}

// Modal Event Listeners
closeModalButton.onclick = closeModal;
cancelEventButton.onclick = closeModal;

window.onclick = (event) => { // Close modal if user clicks outside of it
  if (event.target == eventModal) {
    closeModal();
  }
};

saveEventButton.onclick = () => {
  const time = eventTimeInput.value.trim();
  const desc = eventDescInput.value.trim();

  if (time && desc && currentlySelectedDayKey) {
    const newEvent = { time, desc };
    if (!events[currentlySelectedDayKey]) {
      events[currentlySelectedDayKey] = [];
    }
    events[currentlySelectedDayKey].push(newEvent);
    saveEvents();
    closeModal();
    renderCalendar(currentDate); // Refresh calendar
  } else {
    alert("Please enter both time and description for the event.");
  }
};

// Navigation Event Listeners
document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
};

// Initial render
renderCalendar(currentDate);
