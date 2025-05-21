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
const eventColorSelect = document.getElementById("eventColor");
const eventDescriptionInput = document.getElementById("eventDescription");

const startTimeGroup = document.getElementById("startTimeGroup");
const endTimeGroup = document.getElementById("endTimeGroup");


let currentDate = new Date();
// Events stored as { "YYYY-MM-DD": [eventObj1, eventObj2] }
// Keys are now YYYY-MM-DD strings directly from the date input.
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

// Helper to create a consistent storage key (YYYY-MM-DD string)
// Takes a YYYY-MM-DD date string (from input) and returns it directly as the key.
function getEventStorageKey(dateString) {
    // This function now simply returns the YYYY-MM-DD string as the key.
    // It's assumed dateString is already in 'YYYY-MM-DD' format from input[type="date"]
    return dateString;
}

function openModalForNewEvent(date) {
  // Use formatDate to get the YYYY-MM-DD string for the key
  currentlySelectedDayKey = getEventStorageKey(formatDate(date));
  editingEventId = null;

  modalTitle.textContent = "Add Event";
  deleteEventButton.style.display = "none"; // Hide delete for new event

  const todayStr = formatDate(date);
  eventStartDateInput.value = todayStr;
  eventEndDateInput.value = todayStr;

  // Sensible default times (e.g., next hour, rounded to nearest hour)
  const now = new Date();
  let defaultStartTime = new Date(date);
  // Set to top of next hour, ensuring it's on the selected day
  defaultStartTime.setHours(now.getHours() + 1, 0, 0, 0);
  if (defaultStartTime.getDate() !== date.getDate() && defaultStartTime.getHours() < 24) {
      // If next hour rolls into next day due to timezone or just being late in day, default to 9 AM
      defaultStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
  }


  let defaultEndTime = new Date(defaultStartTime);
  defaultEndTime.setHours(defaultStartTime.getHours() + 1);

  eventStartTimeInput.value = formatTime(defaultStartTime);
  eventEndTimeInput.value = formatTime(defaultEndTime);


  eventNameInput.value = "";
  eventAllDayCheckbox.checked = false;
  eventRepeatSelect.value = "none";
  eventColorSelect.value = "default"; // Set default color
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
    eventColorSelect.value = eventData.color || "default"; // Set existing color or default
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
    // Create Date object for the current day being rendered (local time)
    const currentDateObj = new Date(year, month, day);
    // Get the storage key (YYYY-MM-DD string) for the current day being rendered
    const dayKey = getEventStorageKey(formatDate(currentDateObj));

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
        // Prevent rendering of events without a name (e.g., corrupted entries)
        if (!event.name) {
            console.warn("Skipping rendering of an event with no name:", event);
            return;
        }

        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        // Apply color class
        eventEl.classList.add(event.color || (event.isAllDay ? "teal" : "default"));

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
  const startDate = eventStartDateInput.value; // YYYY-MM-DD string from input
  const startTime = eventStartTimeInput.value; // HH:MM
  const endDate = eventEndDateInput.value;     // YYYY-MM-DD string from input
  const endTime = eventEndTimeInput.value;     // HH:MM
  const isAllDay = eventAllDayCheckbox.checked;
  const repeat = eventRepeatSelect.value;
  const color = eventColorSelect.value; // Get selected color
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

  // Robust Date object creation for comparison (parsing YYYY-MM-DD parts)
  // Month is 0-indexed in Date constructor, so subtract 1
  const [startYear, startMonth, startDay] = startDate.split('-').map(Number);
  const [endYear, endMonth, endDay] = endDate.split('-').map(Number);

  const startDateTime = new Date(startYear, startMonth - 1, startDay,
                                 isAllDay ? 0 : parseInt(startTime.split(':')[0]),
                                 isAllDay ? 0 : parseInt(startTime.split(':')[1] || '0')); // Handle empty minutes

  const endDateTime = new Date(endYear, endMonth - 1, endDay,
                               isAllDay ? 23 : parseInt(endTime.split(':')[0]),
                               isAllDay ? 59 : parseInt(endTime.split(':')[1] || '0')); // Handle empty minutes


  if (endDateTime < startDateTime) {
    alert("End date/time cannot be before start date/time.");
    return;
  }

  const eventData = {
    id: editingEventId || generateId(),
    name,
    startDate, // Store as YYYY-MM-DD string
    startTime: isAllDay ? null : startTime,
    endDate,   // Store as YYYY-MM-DD string
    endTime: isAllDay ? null : endTime,
    isAllDay,
    repeat,
    color, // Store the selected color
    description,
  };

  // The storage key is simply the startDate string
  const newEventStorageKey = getEventStorageKey(startDate);

  if (editingEventId) {
    // Editing an existing event
    // Find the event's current location and remove it regardless of `currentlySelectedDayKey`
    let oldEventStorageKey = null;
    for (const key in events) {
        if (events.hasOwnProperty(key) && Array.isArray(events[key])) {
            const eventIndex = events[key].findIndex(ev => ev.id === editingEventId);
            if (eventIndex !== -1) {
                oldEventStorageKey = key;
                events[key].splice(eventIndex, 1);
                if (events[key].length === 0) {
                    delete events[key];
                }
                break;
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
