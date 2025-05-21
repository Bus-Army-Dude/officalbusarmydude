const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");

let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const monthKey = `${year}-${month}`;

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  // Display month and year
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

    dayDiv.innerHTML = `<span>${day}</span><div class="event-list"></div>`;
    const eventListDiv = dayDiv.querySelector(".event-list");

    // Load saved events for this day
    if (events[dayKey]) {
      events[dayKey].forEach(event => {
        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        eventEl.textContent = `${event.time} - ${event.desc}`;
        eventListDiv.appendChild(eventEl);
      });
    }

    dayDiv.addEventListener("click", () => {
      const time = prompt("Enter time (e.g. 2:30 PM):");
      const desc = prompt("Enter event description:");
      if (time && desc) {
        const newEvent = { time, desc };
        if (!events[dayKey]) events[dayKey] = [];
        events[dayKey].push(newEvent);
        saveEvents();
        renderCalendar(currentDate); // Refresh calendar
      }
    });

    calendarGrid.appendChild(dayDiv);
  }
}

document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate);
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate);
};

renderCalendar(currentDate);
