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
// Events stored as { "YYYY-M-D": [eventObj1, eventObj2] }
// Month is 0-indexed in the key for consistency with Date.getMonth()
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let currentlySelectedDayKey = null; // Key of the day cell that was clicked
let editingEventId = null; // To store the ID of the event being edited

function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
}

// Helper to get YYYY-MM-DD from a Date object (for input[type="date"] value)
function formatDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() is 0-indexed
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to get HH:MM from a Date object (for input[type="time"] value)
function formatTime(dateObj) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Helper to create a consistent storage key (YYYY-M-D, 0-indexed month)
function getEventStorageKey(dateObj) {
    return `${dateObj.getFullYear()}-${dateObj.getMonth()}-${dateObj.getDate()}`;
}

function openModalForNewEvent(date) {
  currentlySelectedDayKey = getEventStorageKey(date); // Store the actual day key
  editingEventId = null;

  modalTitle.textContent = "Add Event";
  deleteEventButton.style.display = "none"; // Hide delete for new event

  const todayStr = formatDate(date);
  eventStartDateInput.value = todayStr;
  eventEndDateInput.value = todayStr;

  // Sensible default times (e.g., next hour, rounded to nearest hour)
  const now = new Date();
  let defaultStartTime = new Date(date);
  defaultStartTime.setHours(now.getHours() + 1, 0, 0, 0); // Set to top of next hour
  if (defaultStartTime.getDate() !== date.getDate() && defaultStartTime.getHours() < 24) { // Handle case where next hour rolls into next day
      defaultStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0); // Default to 9 AM for the selected day
  }


  let defaultEndTime = new Date(defaultStartTime);
  defaultEndTime.setHours(defaultStartTime.getHours() + 1);

  eventStartTimeInput.value = formatTime(defaultStartTime);
  eventEndTimeInput.value = formatTime(defaultEndTime);


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
    deleteEventButton.style.display = "inline-block"; // Show delete for existing event

    eventNameInput.value = eventData.name;
    eventStartDateInput.value = eventData.startDate;
    eventStartTimeInput.value = eventData.startTime || ""; // Use empty string if null
    eventEndDateInput.value = eventData.endDate;
    eventEndTimeInput.value = eventData.endTime || ""; // Use empty string if null
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
  // Clear any validation messages if you add them later
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
    // This dayKey uses 0-indexed month, consistent with how `events` are stored
    const dayKey = getEventStorageKey(currentDateObj);

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
      // Sort events by start time for consistent display
      events[dayKey].sort((a, b) => {
          if (a.isAllDay && !b.isAllDay) return -1; // All-day events first
          if (!a.isAllDay && b.isAllDay) return 1;
          if (!a.startTime || !b.startTime) return 0; // Handle null times if any
          return a.startTime.localeCompare(b.startTime);
      });

      events[dayKey].forEach(event => {
        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        if (event.isAllDay) {
            eventEl.classList.add("all-day");
        }
        // Display time only if not all-day
        eventEl.textContent = `${event.isAllDay ? 'All-day' : (event.startTime || '')} ${event.name}`;
        eventEl.title = `${event.name}\n${event.isAllDay ? 'All-day' : (event.startTime + ' - ' + event.endTime)}\n${event.description || ''}`;
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent day cell click when clicking event
            openModalForEditEvent(event, dayKey); // Pass the event data and its current dayKey
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
  const startDate = eventStartDateInput.value; // YYYY-MM-DD
  const startTime = eventStartTimeInput.value; // HH:MM
  const endDate = eventEndDateInput.value;     // YYYY-MM-DD
  const endTime = eventEndTimeInput.value;     // HH:MM
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
  // Create Date objects for comparison
  const startDateTime = new Date(`${startDate}T${isAllDay ? '00:00' : startTime || '00:00'}`);
  const endDateTime = new Date(`${endDate}T${isAllDay ? '23:59' : endTime || '23:59'}`);

  if (endDateTime < startDateTime) {
    alert("End date/time cannot be before start date/time.");
    return;
  }

  const eventData = {
    id: editingEventId || generateId(),
    name,
    startDate, // Storing as YYYY-MM-DD string
    startTime: isAllDay ? null : startTime,
    endDate,   // Storing as YYYY-MM-DD string
    endTime: isAllDay ? null : endTime,
    isAllDay,
    repeat,
    description,
  };

  // Determine the key where this event should be stored.
  // Use a Date object derived from startDate string to get the 0-indexed month.
  const newEventStorageKey = getEventStorageKey(new Date(startDate));

  if (editingEventId) {
    // Editing an existing event
    let oldEventStorageKey = null;

    // Find the event's current location and remove it
    for (const key in events) {
        if (events.hasOwnProperty(key) && Array.isArray(events[key])) {
            const eventIndex = events[key].findIndex(ev => ev.id === editingEventId);
            if (eventIndex !== -1) {
                // Found the event, store its old key
                oldEventStorageKey = key;
                // Remove the event from its old location
                events[key].splice(eventIndex, 1);
                // Clean up if the day array becomes empty
                if (events[key].length === 0) {
                    delete events[key];
                }
                break; // Event found and removed, exit loop
            }
        }
    }

    // Add the (potentially updated) event to its new/current location
    if (!events[newEventStorageKey]) {
      events[newEventStorageKey] = [];
    }
    events[newEventStorageKey].push(eventData);

  } else {
    // Adding a new event
    if (!events[newEventStorageKey]) {
      events[newEventStorageKey] = [];
    }
    events[newEventStorageKey].push(eventData);
  }

  saveEvents();
  closeModal();
  renderCalendar(currentDate); // Re-render the calendar to show changes
};


deleteEventButton.onclick = () => {
    if (!editingEventId) {
        console.warn("No event ID selected for deletion.");
        return;
    }

    let eventFoundAndDeleted = false;
    // Iterate through all stored day keys to find the event by its ID
    for (const key in events) {
        if (events.hasOwnProperty(key) && Array.isArray(events[key])) {
            const eventIndex = events[key].findIndex(ev => ev.id === editingEventId);
            if (eventIndex !== -1) {
                events[key].splice(eventIndex, 1); // Remove the event
                if (events[key].length === 0) {
                    delete events[key]; // Remove the day entry if it becomes empty
                }
                eventFoundAndDeleted = true;
                break; // Event found and deleted, no need to search further
            }
        }
    }

    if (eventFoundAndDeleted) {
        saveEvents();
        console.log("Event deleted successfully:", editingEventId);
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
  currentDate = new Date(); // Reset to today's date
  renderCalendar(currentDate);
};


// Initial render
renderCalendar(currentDate);
