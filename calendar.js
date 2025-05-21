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
// Keys are YYYY-MM-DD strings directly from the date input.
let events = JSON.parse(localStorage.getItem("calendarEvents")) || {};
let currentlySelectedDayKey = null; // Key of the day cell that was clicked
let editingEventId = null; // To store the ID of the event being edited

// Set to keep track of active reminder timeouts to clear them if needed
const activeReminders = new Set();


function generateId() {
  return Math.random().toString(36).substr(2, 9);
}

function saveEvents() {
  localStorage.setItem("calendarEvents", JSON.stringify(events));
  // Clear existing reminders and set new ones after saving events
  clearAllReminders();
  setEventReminders();
}

// Helper to get YYYY-MM-DD from a Date object (for input[type="date"] value)
function formatDate(dateObj) {
    const year = dateObj.getFullYear();
    const month = (dateObj.getMonth() + 1).toString().padStart(2, '0'); // +1 because getMonth() is 0-indexed
    const day = dateObj.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Helper to get HH:MM (24-hour format) from a Date object (for input[type="time"] value)
function formatTime(dateObj) {
    const hours = dateObj.getHours().toString().padStart(2, '0');
    const minutes = dateObj.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}

// Helper to convert 24-hour time string (HH:MM) to 12-hour format (H:MM AM/PM)
function displayTime(time24h) {
    if (!time24h) return ''; // Handle empty or null times

    const [hours, minutes] = time24h.split(':').map(Number);
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
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

  eventStartTimeInput.value = formatTime(defaultStartTime); // Uses 24-hour for input
  eventEndTimeInput.value = formatTime(defaultEndTime); // Uses 24-hour for input


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

  // Temporary object to hold events for the current month, including recurring ones
  // Key: YYYY-MM-DD, Value: Array of event objects
  const eventsForMonth = {};

  // 1. Add directly stored events for the current month
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const currentDateObj = new Date(year, month, day);
    const dayKey = getEventStorageKey(formatDate(currentDateObj));
    if (events[dayKey]) {
      eventsForMonth[dayKey] = [...(events[dayKey] || [])]; // Clone to avoid modifying original
    } else {
      eventsForMonth[dayKey] = [];
    }
  }

  // 2. Add recurring events
  // Iterate over ALL stored events to find recurring ones
  for (const storedDayKey in events) {
    if (events.hasOwnProperty(storedDayKey) && Array.isArray(events[storedDayKey])) {
      events[storedDayKey].forEach(event => {
        if (!event.name) {
            console.warn("Skipping processing of an event with no name:", event);
            return; // Skip malformed events from recurrence logic
        }

        // Robustly parse the start date for recurrence logic in local time
        const [startYearRec, startMonthRec, startDayRec] = event.startDate.split('-').map(Number);
        const eventStartDateObj = new Date(startYearRec, startMonthRec - 1, startDayRec); // Month is 0-indexed
        const eventStartDateKey = getEventStorageKey(formatDate(eventStartDateObj));


        for (let day = 1; day <= totalDaysInMonth; day++) {
            const currentRenderDayObj = new Date(year, month, day); // This is already local
            const currentRenderDayKey = getEventStorageKey(formatDate(currentRenderDayObj));

            // Ensure the recurring event is not before its original start date
            // The time component is ignored for recurrence matching, only date matters
            if (currentRenderDayObj < eventStartDateObj) {
                continue;
            }

            // If the current day being rendered is the original start date of the event,
            // we should NOT add a recurring instance, because the original event
            // is already picked up in step 1 ("Add directly stored events").
            if (currentRenderDayKey === eventStartDateKey) {
                continue;
            }

            let shouldAddRecurringInstance = false;
            switch (event.repeat) {
                case "daily":
                    shouldAddRecurringInstance = true; // Daily events repeat every day after start date
                    break;
                case "weekly":
                    // Check if the day of the week matches
                    shouldAddRecurringInstance = (currentRenderDayObj.getDay() === eventStartDateObj.getDay());
                    break;
                case "monthly":
                    // Check if the day of the month matches
                    shouldAddRecurringInstance = (currentRenderDayObj.getDate() === eventStartDateObj.getDate());
                    break;
                // case "none": // Handled by not entering this loop or just passing through
                default:
                    shouldAddRecurringInstance = false;
                    break;
            }


            if (shouldAddRecurringInstance) {
                const recurringInstance = {
                    ...event, // Copy all properties
                    isRecurringInstance: true // Mark as a recurring instance
                };
                // Add to the eventsForMonth for this specific day
                if (!eventsForMonth[currentRenderDayKey]) {
                    eventsForMonth[currentRenderDayKey] = [];
                }
                eventsForMonth[currentRenderDayKey].push(recurringInstance);
            }
          }
      });
    }
  }


  // Now, populate the calendar grid using the consolidated eventsForMonth
  for (let day = 1; day <= totalDaysInMonth; day++) {
    const dayDiv = document.createElement("div");
    dayDiv.classList.add("day-cell");
    const currentDateObj = new Date(year, month, day);
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

    // Display events from the consolidated eventsForMonth
    if (eventsForMonth[dayKey] && eventsForMonth[dayKey].length > 0) {
      // Sort events by start time for consistent display
      eventsForMonth[dayKey].sort((a, b) => {
          if (a.isAllDay && !b.isAllDay) return -1;
          if (!a.isAllDay && b.isAllDay) return 1;
          if (!a.startTime || !b.startTime) return 0;
          return a.startTime.localeCompare(b.startTime);
      });

      eventsForMonth[dayKey].forEach(event => {
        // Redundant check, but good for safety if eventsForMonth was built imperfectly
        if (!event.name) {
            console.warn("Skipping rendering of an event with no name after consolidation:", event);
            return;
        }

        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        // Apply color class
        eventEl.classList.add(event.color || (event.isAllDay ? "teal" : "default"));

        // Display time only if not all-day, using the new displayTime function
        const timeDisplay = event.isAllDay ? 'All-day' : displayTime(event.startTime || '');
        const tooltipTimeRange = event.isAllDay ? 'All-day' : (displayTime(event.startTime || '') + ' - ' + displayTime(event.endTime || ''));


        eventEl.textContent = `${timeDisplay} ${event.name}`;
        eventEl.title = `${event.name}\n${event.description || 'No description.'}\n${tooltipTimeRange}`; // Improved tooltip
        eventEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent day cell click when clicking event
            // When editing a recurring instance, always open the original event for edit
            openModalForEditEvent(event, getEventStorageKey(event.startDate));
        });
        eventListDiv.appendChild(eventEl);
      });

      // Add event count badge for days with events
      const eventCount = eventsForMonth[dayKey].length;
      if (eventCount > 0) {
          const countBadge = document.createElement("div");
          countBadge.classList.add("event-count-badge");
          countBadge.textContent = eventCount;
          dayDiv.appendChild(countBadge);
      }
    }
    dayDiv.appendChild(eventListDiv);

    dayDiv.addEventListener("click", () => {
      openModalForNewEvent(currentDateObj);
    });

    calendarGrid.appendChild(dayDiv);
  }
}


// MODAL RELATED FUNCTIONS AND LISTENERS

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

  const startHour = isAllDay ? 0 : parseInt(startTime.split(':')[0]);
  const startMinute = isAllDay ? 0 : parseInt(startTime.split(':')[1] || '0');

  const endHour = isAllDay ? 23 : parseInt(endTime.split(':')[0]);
  const endMinute = isAllDay ? 59 : parseInt(endTime.split(':')[1] || '0');

  const startDateTime = new Date(startYear, startMonth - 1, startDay, startHour, startMinute);
  const endDateTime = new Date(endYear, endMonth - 1, endDay, endHour, endMinute);


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
                events[key].splice(eventIndex, 1);
                if (events[key].length === 0) {
                    delete events[key];
                }
                oldEventStorageKey = key; // Store the key where it was found
                break; // Event found and removed, no need to search further
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


// NAVIGATION AND REMINDER FUNCTIONS

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

// Reminder Logic
function clearAllReminders() {
    activeReminders.forEach(timeoutId => clearTimeout(timeoutId));
    activeReminders.clear();
}

function setEventReminders() {
    clearAllReminders(); // Clear any existing reminders first

    const now = new Date();

    for (const dayKey in events) {
        if (events.hasOwnProperty(dayKey) && Array.isArray(events[dayKey])) {
            events[dayKey].forEach(event => {
                if (event.isAllDay || !event.startTime) {
                    return; // No time-based reminder for all-day events or events without a start time
                }

                // Construct event date/time object
                const [eventYear, eventMonth, eventDay] = event.startDate.split('-').map(Number);
                const [eventHour, eventMinute] = event.startTime.split(':').map(Number);
                const eventDateTime = new Date(eventYear, eventMonth - 1, eventDay, eventHour, eventMinute);

                const timeUntilEvent = eventDateTime.getTime() - now.getTime();

                // Set reminder if event is in the future (up to 24 hours from now for efficiency)
                // In a real app, this would be handled by a backend/server
                // For client-side, we limit the look-ahead to avoid too many timeouts
                if (timeUntilEvent > 0 && timeUntilEvent < (24 * 60 * 60 * 1000)) { // Within next 24 hours
                    const timeoutId = setTimeout(() => {
                        alert(`Reminder: Event "${event.name}" is starting now at ${displayTime(event.startTime)}!`);
                        activeReminders.delete(timeoutId); // Remove from set after triggering
                    }, timeUntilEvent);
                    activeReminders.add(timeoutId);
                }
            });
        }
    }
    console.log(`Set ${activeReminders.size} reminders for events within the next 24 hours.`);
}


// INITIALIZATION
renderCalendar(currentDate);
setEventReminders(); // Set reminders when the page loads
