const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");
const todayButton = document.getElementById("todayButton");

// Modal elements
const eventModal = document.getElementById("eventModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalButton = document.getElementById("closeModalButton");
const saveEventButton = document.getElementById("saveEventButton");
const cancelEventButton = document.getElementById("cancelEventButton");
const deleteEventButton = document.getElementById("deleteEventButton");

const eventNameInput = document.getElementById("eventName");
const eventStartDateInput = document.getElementById("eventStartDate");
const eventStartTimeInput = document.getElementById("eventStartTime");
const eventEndDateInput = document.getElementById("eventEndDate");
const eventEndTimeInput = document.getElementById("eventEndTime");
const eventAllDayCheckbox = document.getElementById("eventAllDay");
const eventRepeatSelect = document.getElementById("eventRepeat");
const eventDescriptionInput = document.getElementById("eventDescription");

const startTimeGroup = document.getElementById("startTimeGroup");
const endTimeGroup = document.getElementById("endTimeGroup");


let currentDate = new Date();
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {}; // { "YYYY-M-D": [eventObj1, eventObj2] }
let currentlySelectedDayKey = null;
let editingEventId = null; // To store the ID of the event being edited

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

function formatDate(dateObj) { // Helper to get YYYY-MM-DD
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function formatTime(dateObj) { // Helper to get HH:MM
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

function openModalForNewEvent(date) {
  currentlySelectedDayKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
  editingEventId = null;

  modalTitle.textContent = "Add Event";
  deleteEventButton.style.display = "none";

  const todayStr = formatDate(date);
  eventStartDateInput.value = todayStr;
  eventEndDateInput.value = todayStr;

  // Sensible default times (e.g., next hour)
  const nextHour = new Date(date);
  nextHour.setHours(date.getHours() + 1, 0, 0, 0); // Set to top of next hour
  eventStartTimeInput.value = formatTime(nextHour);

  const oneHourLater = new Date(nextHour);
  oneHourLater.setHours(nextHour.getHours() + 1);
  eventEndTimeInput.value = formatTime(oneHourLater);


  eventNameInput.value = "";
  eventAllDayCheckbox.checked = false;
  eventRepeatSelect.value = "none";
  eventDescriptionInput.value = "";

  toggleTimeInputs(); // Ensure time inputs are visible initially
  eventModal.style.display = "block";
  eventNameInput.focus();
}

function openModalForEditEvent(eventData, dayKey) {
    currentlySelectedDayKey = dayKey; // The original day key where event was clicked
    editingEventId = eventData.id;

    modalTitle.textContent = "Edit Event";
    deleteEventButton.style.display = "inline-block";

    eventNameInput.value = eventData.name;
    eventStartDateInput.value = eventData.startDate;
    eventStartTimeInput.value = eventData.isAllDay ? "" : eventData.startTime;
    eventEndDateInput.value = eventData.endDate;
    eventEndTimeInput.value = eventData.isAllDay ? "" : eventData.endTime;
    eventAllDayCheckbox.checked = eventData.isAllDay;
    eventRepeatSelect.value = eventData.repeat || "none";
    eventDescriptionInput.value = eventData.description || "";

    toggleTimeInputs();
    eventModal.style.display = "block";
    eventNameInput.focus();
}


function closeModal() {
  eventModal.style.display = "none";
  currentlySelectedDayKey = null;
  editingEventId = null;
}

function toggleTimeInputs() {
  if (eventAllDayCheckbox.checked) {
    startTimeGroup.classList.add("hidden");
    endTimeGroup.classList.add("hidden");
  } else {
    startTimeGroup.classList.remove("hidden");
    endTimeGroup.classList.remove("hidden");
  }
}

eventAllDayCheckbox.addEventListener("change", toggleTimeInputs);


function renderCalendar(dateToDisplay) {
  const year = dateToDisplay.getFullYear();
  const month = dateToDisplay.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  monthYearDisplay.textContent = `${dateToDisplay.toLocaleString("default", { month: "long" })} ${year}`;
  calendarGrid.innerHTML = "";

  // Add empty cells for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarGrid.innerHTML += `<div class="empty"></div>`;
  }

  // Add day cells for the current month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day-cell");
    const currentDateObj = new Date(year, month, day);
    const dayKey = `${year}-${month}-${day}`; // Consistent key

    const dayNumberSpan = document.createElement("span");
    dayNumberSpan.classList.add("day-number");
    dayNumberSpan.textContent = day;
    dayDiv.appendChild(dayNumberSpan);

    const today = new Date();
    if (
      year === today.getFullYear() &&
      month === today.getMonth() &&
      day === today.getDate()
    ) {
      dayDiv.classList.add("current-day");
    }

    const eventListDiv = document.createElement("div");
    eventListDiv.classList.add("event-list");

    // Load and display events for this dayKey
    if (events[dayKey]) {
      events[dayKey].forEach(event => {
        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        if (event.isAllDay) {
            eventEl.classList.add("all-day");
        }
        eventEl.textContent = `${event.isAllDay ? '' : (event.startTime + ' ')} ${event.name}`;
        eventEl.title = `${event.name}\n${event.isAllDay ? 'All-day' : (event.startTime + ' - ' + event.endTime)}\n${event.description || ''}`;
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent day cell click when clicking event
            openModalForEditEvent(event, dayKey);
        });
        eventListDiv.appendChild(eventEl);
      });
    }
    dayDiv.appendChild(eventListDiv);

    dayDiv.addEventListener("click", () => {
      openModalForNewEvent(currentDateObj);
    });

    calendarGrid.appendChild(dayDiv);
  }
}


// Modal Event Listeners
closeModalButton.onclick = closeModal;
cancelEventButton.onclick = closeModal;

window.onclick = (event) => {
  if (event.target == eventModal) {
    closeModal();
  }
};

saveEventButton.onclick = () => {
  const name = eventNameInput.value.trim();
  const startDate = eventStartDateInput.value;
  const startTime = eventStartTimeInput.value;
  const endDate = eventEndDateInput.value;
  const endTime = eventEndTimeInput.value;
  const isAllDay = eventAllDayCheckbox.checked;
  const repeat = eventRepeatSelect.value;
  const description = eventDescriptionInput.value.trim();

  if (!name) {
    alert("Event name is required.");
    return;
  }
  if (!startDate || !endDate) {
    alert("Start and End dates are required.");
    return;
  }
  if (!isAllDay && (!startTime || !endTime)) {
    alert("Start and End times are required for non-all-day events.");
    return;
  }

  // Basic validation: end date/time should not be before start date/time
  const startDateTimeStr = `${startDate}${isAllDay ? 'T00:00' : 'T' + startTime}`;
  const endDateTimeStr = `${endDate}${isAllDay ? 'T23:59' : 'T' + endTime}`;

  if (new Date(endDateTimeStr) < new Date(startDateTimeStr)) {
    alert("End date/time cannot be before start date/time.");
    return;
  }

  const eventData = {
    id: editingEventId || generateId(),
    name,
    startDate,
    startTime: isAllDay ? null : startTime,
    endDate,
    endTime: isAllDay ? null : endTime,
    isAllDay,
    repeat,
    description,
  };

  // --- Event Storage Logic ---
  // For simplicity, we'll store the event only on its start date for now.
  // A more complex app would handle multi-day and recurring events by
  // potentially storing them in a master list and then calculating occurrences.

  const eventStorageKey = `${new Date(startDate).getFullYear()}-${new Date(startDate).getMonth()}-${new Date(startDate).getDate()}`;


  if (editingEventId) {
    // Find and update existing event. This is simplified.
    // If the date changed, we need to remove from old key and add to new.
    // For now, assumes date doesn't change or we find it across all event lists.
    let found = false;
    for (const key in events) { // Search across all dayKeys
        const dayEvents = events[key];
        const eventIndex = dayEvents.findIndex(ev => ev.id === editingEventId);
        if (eventIndex !== -1) {
            // If start date changed, remove from old list
            if (key !== eventStorageKey) {
                dayEvents.splice(eventIndex, 1);
                if (dayEvents.length === 0) delete events[key]; // Clean up empty day
            } else { // Update in place
                dayEvents[eventIndex] = eventData;
                found = true; // Mark as updated
                break;
            }
        }
    }
    // If it was moved to a new date (or wasn't found and needs to be added to its new date)
    if (!events[eventStorageKey]) events[eventStorageKey] = [];
    // Ensure not to add duplicate if it was already updated in place on same key
    if (!found || (found && events[eventStorageKey].findIndex(ev => ev.id === editingEventId) === -1)) {
        // If it was removed from an old key, or is genuinely new to this key
        const existingIndexOnNewKey = events[eventStorageKey].findIndex(ev => ev.id === editingEventId);
        if (existingIndexOnNewKey !== -1) { // If an event with this ID already on new key (e.g., date unchanged)
            events[eventStorageKey][existingIndexOnNewKey] = eventData;
        } else {
            events[eventStorageKey].push(eventData);
        }
    }

  } else { // New event
    if (!events[eventStorageKey]) {
      events[eventStorageKey] = [];
    }
    events[eventStorageKey].push(eventData);
  }


  saveEvents();
  closeModal();
  renderCalendar(currentDate);
};


deleteEventButton.onclick = () => {
    if (!editingEventId || !currentlySelectedDayKey) return;

    // Find and remove the event
    // This simplified logic assumes the event is in 'currentlySelectedDayKey'
    // A robust solution would search if the event's start date has changed.
    let eventFoundAndDeleted = false;
    for (const key in events) {
        if (events[key]) {
            const eventIndex = events[key].findIndex(ev => ev.id === editingEventId);
            if (eventIndex !== -1) {
                events[key].splice(eventIndex, 1);
                if (events[key].length === 0) {
                    delete events[key]; // Clean up if day has no more events
                }
                eventFoundAndDeleted = true;
                break; // Assume unique IDs, so break after finding
            }
        }
    }

    if (eventFoundAndDeleted) {
        saveEvents();
    } else {
        console.warn("Could not find event to delete with ID:", editingEventId);
    }
    closeModal();
    renderCalendar(currentDate);
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

todayButton.onclick = () => {
  currentDate = new Date();
  renderCalendar(currentDate);
};


// Initial render
renderCalendar(currentDate);
