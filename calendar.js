const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");

let currentDate = new Date();

function renderCalendar(date) {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const totalDays = lastDayOfMonth.getDate();

  // Set month and year
  const monthName = date.toLocaleString("default", { month: "long" });
  monthYearDisplay.textContent = `${monthName} ${year}`;

  // Clear old grid
  calendarGrid.innerHTML = "";

  // Add blank divs before the 1st day
  for (let i = 0; i < startDay; i++) {
    calendarGrid.innerHTML += `<div></div>`;
  }

  // Fill in the days
  for (let i = 1; i <= totalDays; i++) {
    const dayDiv = document.createElement("div");
    dayDiv.innerHTML = `<span>${i}</span>`;
    dayDiv.addEventListener("click", () => {
      const note = prompt(`Add note for ${monthName} ${i}, ${year}:`);
      if (note) {
        const noteTag = document.createElement("div");
        noteTag.textContent = note;
        noteTag.style.fontSize = "12px";
        noteTag.style.marginTop = "20px";
        dayDiv.appendChild(noteTag);
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
