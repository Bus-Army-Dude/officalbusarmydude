const monthYearDisplay = document.getElementById("monthYear");
const calendarGrid = document.getElementById("calendarGrid");
const todayButton = document.getElementById("todayButton");
const eventSearchInput = document.getElementById("eventSearchInput");
const goToDateInput = document.getElementById("goToDateInput"); // NEW: Go to date input

// Modal elements
const eventModal = document.getElementById("eventModal");
const modalTitle = document.getElementById("modalTitle");
const closeModalButton = document.getElementById("closeModalButton");
const saveEventButton = document.getElementById("saveEventButton");
const cancelEventButton = document.getElementById("cancelEventButton");
const deleteEventButton = document.getElementById("deleteEventButton");

const eventNameInput = document.getElementById("eventName");
const eventAddressInput = document.getElementById("eventAddress"); // NEW: Address input
const eventStartDateInput = document.getElementById("eventStartDate");
const eventStartTimeInput = document.getElementById("eventStartTime");
const eventEndDateInput = document.getElementById("eventEndDate");
const eventEndTimeInput = document.getElementById("eventEndTime");
const eventAllDayCheckbox = document.getElementById("eventAllDay");
const eventRepeatSelect = document.getElementById("eventRepeat");
const eventRepeatEndDateInput = document.getElementById("eventRepeatEndDate"); // NEW: Recurrence End Date
const recurrenceEndDateGroup = document.querySelector(".recurrence-end-date-group"); // NEW: Group for recurrence end date
const eventColorSelect = document.getElementById("eventColor");
const eventDescriptionInput = document.getElementById("eventDescription");

const startTimeGroup = document.getElementById("startTimeGroup");
const endTimeGroup = document = document.getElementById("endTimeGroup");


let currentDate = new Date();
// Events stored as { "YYYY-MM-DD": [eventObj1, eventObj2] }
// Keys are YYYY-MM-DD strings directly from the date input.
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
    return dateString;
}

function openModalForNewEvent(date) {
  currentlySelectedDayKey = getEventStorageKey(formatDate(date));
  editingEventId = null;

  modalTitle.textContent = "Add Event";
  deleteEventButton.style.display = "none"; // Hide delete for new event

  const todayStr = formatDate(date);
  eventStartDateInput.value = todayStr;
  eventEndDateInput.value = todayStr;

  const now = new Date();
  let defaultStartTime = new Date(date);
  defaultStartTime.setHours(now.getHours() + 1, 0, 0, 0);
  if (defaultStartTime.getDate() !== date.getDate() && defaultStartTime.getHours() < 24) {
      defaultStartTime = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 9, 0);
  }

  let defaultEndTime = new Date(defaultStartTime);
  defaultEndTime.setHours(defaultStartTime.getHours() + 1);

  eventNameInput.value = "";
  eventAddressInput.value = ""; // NEW: Clear address
  eventStartTimeInput.value = formatTime(defaultStartTime);
  eventEndTimeInput.value = formatTime(defaultEndTime);
  eventAllDayCheckbox.checked = false;
  eventRepeatSelect.value = "none";
  eventRepeatEndDateInput.value = ""; // NEW: Clear recurrence end date
  eventColorSelect.value = "default";
  eventDescriptionInput.value = "";

  toggleTimeInputs();
  toggleRecurrenceEndDate(); // NEW: Toggle recurrence end date visibility
  eventModal.style.display = "block";
  eventNameInput.focus();
}

function openModalForEditEvent(eventData, dayKey) {
    currentlySelectedDayKey = dayKey;
    editingEventId = eventData.id;

    modalTitle.textContent = "Edit Event";
    deleteEventButton.style.display = "inline-block"; // Show delete for existing event

    eventNameInput.value = eventData.name;
    eventAddressInput.value = eventData.address || ""; // NEW: Populate address
    eventStartDateInput.value = eventData.startDate;
    eventStartTimeInput.value = eventData.startTime || "";
    eventEndDateInput.value = eventData.endDate;
    eventEndTimeInput.value = eventData.endTime || "";
    eventAllDayCheckbox.checked = eventData.isAllDay;
    eventRepeatSelect.value = eventData.repeat || "none";
    eventRepeatEndDateInput.value = eventData.repeatEndDate || ""; // NEW: Populate recurrence end date
    eventColorSelect.value = eventData.color || "default";
    eventDescriptionInput.value = eventData.description || "";

    toggleTimeInputs();
    toggleRecurrenceEndDate(); // NEW: Toggle recurrence end date visibility
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

// NEW: Function to toggle visibility of recurrence end date input
function toggleRecurrenceEndDate() {
    if (eventRepeatSelect.value === "none") {
        recurrenceEndDateGroup.classList.add("hidden");
    } else {
        recurrenceEndDateGroup.classList.remove("hidden");
    }
}

eventAllDayCheckbox.addEventListener("change", toggleTimeInputs);
// NEW: Listen for changes on repeat select to show/hide recurrence end date
eventRepeatSelect.addEventListener("change", toggleRecurrenceEndDate);


function renderCalendar(dateToDisplay, searchQuery = '') {
  const year = dateToDisplay.getFullYear();
  const month = dateToDisplay.getMonth(); // 0-indexed

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday
  const totalDaysInMonth = lastDayOfMonth.getDate();

  monthYearDisplay.textContent = `${dateToDisplay.toLocaleString("default", { month: "long" })} ${year}`;
  calendarGrid.innerHTML = "";

  // Set the "Go to Date" input value to the current month/year
  goToDateInput.value = `${year}-${(month + 1).toString().padStart(2, '0')}`;


  // Add empty cells for days before the first of the month
  for (let i = 0; i < startDayOfWeek; i++) {
    calendarGrid.innerHTML += `<div class="empty"></div>`;
  }

  const eventsForMonth = {}; // Key: YYYY-MM-DD, Value: Array of event objects

  // Helper to add an event to eventsForMonth, handling multi-day spans
  function addEventToDisplayMap(event, dateObjToAdd) {
    const dayKey = getEventStorageKey(formatDate(dateObjToAdd));
    if (!eventsForMonth[dayKey]) {
      eventsForMonth[dayKey] = [];
    }
    // Only add if not already present (important for multi-day and recurrence)
    if (!eventsForMonth[dayKey].some(e => e.id === event.id)) {
      eventsForMonth[dayKey].push(event);
    }
  }

  // 1. Process directly stored events and their multi-day spans
  for (const storedDayKey in events) { // Iterate through all keys where events are stored
    if (events.hasOwnProperty(storedDayKey) && Array.isArray(events[storedDayKey])) {
      events[storedDayKey].forEach(event => {
            if (!event.name) return; // Skip malformed events

            // Parse start and end dates of the event
            const [eventStartYear, eventStartMonth, eventStartDay] = event.startDate.split('-').map(Number);
            const eventStartDateObj = new Date(eventStartYear, eventStartMonth - 1, eventStartDay);

            const [eventEndYear, eventEndMonth, eventEndDay] = event.endDate.split('-').map(Number);
            const eventEndDateObj = new Date(eventEndYear, eventEndMonth - 1, eventEndDay);

            // Iterate over the span of the event
            let tempDate = new Date(eventStartDateObj);
            while (tempDate <= eventEndDateObj) {
                // If this spanned day falls within the *current month being rendered*
                if (tempDate.getFullYear() === year && tempDate.getMonth() === month) {
                    addEventToDisplayMap(event, tempDate);
                }
                tempDate.setDate(tempDate.getDate() + 1); // Move to the next day
            }
      });
    }
  }


  // 2. Add recurring events (and their multi-day spans)
  for (const storedDayKey in events) {
    if (events.hasOwnProperty(storedDayKey) && Array.isArray(events[storedDayKey])) {
      events[storedDayKey].forEach(event => {
        if (!event.name) return;

        // NEW: Check if this recurring event has an end date
        let recurrenceEndDateTime = null;
        if (event.repeat !== 'none' && event.repeatEndDate) {
            const [endRecYear, endRecMonth, endRecDay] = event.repeatEndDate.split('-').map(Number);
            recurrenceEndDateTime = new Date(endRecYear, endRecMonth - 1, endRecDay, 23, 59, 59); // End of the day
        }

        const [startYearRec, startMonthRec, startDayRec] = event.startDate.split('-').map(Number);
        const eventStartDateObj = new Date(startYearRec, startMonthRec - 1, startDayRec);

        const [endYearRec, endMonthRec, endDayRec] = event.endDate.split('-').map(Number);
        const eventEndDateObj = new Date(endYearRec, endMonthRec - 1, endDayRec);
        const eventDurationMs = eventEndDateObj.getTime() - eventStartDateObj.getTime(); // Duration in milliseconds

        for (let day = 1; day <= totalDaysInMonth; day++) {
            const currentRenderDayObj = new Date(year, month, day);

            // If a recurrence end date is set, and the current day is past it, skip.
            if (recurrenceEndDateTime && currentRenderDayObj > recurrenceEndDateTime) {
                continue;
            }

            // Ensure the recurring instance isn't before the original event's start date
            if (currentRenderDayObj < eventStartDateObj) {
                continue;
            }

            // Skip if this is the exact original start date, as it's already added in step 1
            if (currentRenderDayObj.getFullYear() === eventStartDateObj.getFullYear() &&
                currentRenderDayObj.getMonth() === eventStartDateObj.getMonth() &&
                currentRenderDayObj.getDate() === eventStartDateObj.getDate()) {
                continue;
            }

            let shouldAddRecurringInstance = false;
            switch (event.repeat) {
                case "daily":
                    shouldAddRecurringInstance = true;
                    break;
                case "weekly":
                    shouldAddRecurringInstance = (currentRenderDayObj.getDay() === eventStartDateObj.getDay());
                    break;
                case "monthly":
                    shouldAddRecurringInstance = (currentRenderDayObj.getDate() === eventStartDateObj.getDate());
                    break;
                case "yearly":
                    shouldAddRecurringInstance = (currentRenderDayObj.getMonth() === eventStartDateObj.getMonth() &&
                                                  currentRenderDayObj.getDate() === eventStartDateObj.getDate());
                    break;
                default:
                    shouldAddRecurringInstance = false;
                    break;
            }

            if (shouldAddRecurringInstance) {
                // Calculate the end date for this recurring instance based on its original duration
                const recurringInstanceStartDate = currentRenderDayObj; // The start of this specific recurrence
                const recurringInstanceEndDate = new Date(recurringInstanceStartDate.getTime() + eventDurationMs);

                // IMPORTANT: If recurring instance end date is past the global recurrence end date,
                // cap it at the global recurrence end date.
                const effectiveInstanceEndDate = (recurrenceEndDateTime && recurringInstanceEndDate > recurrenceEndDateTime)
                    ? recurrenceEndDateTime
                    : recurringInstanceEndDate;


                // Add this recurring instance for all days it spans within the current month
                let tempRecurringDate = new Date(recurringInstanceStartDate);
                while (tempRecurringDate <= effectiveInstanceEndDate) { // Use effectiveInstanceEndDate
                    if (tempRecurringDate.getFullYear() === year && tempRecurringDate.getMonth() === month) {
                         const recurringInstance = {
                            ...event, // Copy all properties
                            startDate: formatDate(recurringInstanceStartDate), // Actual start for this instance
                            endDate: formatDate(effectiveInstanceEndDate),     // Actual end for this instance
                            isRecurringInstance: true // Mark as a recurring instance
                        };
                        addEventToDisplayMap(recurringInstance, tempRecurringDate);
                    }
                    tempRecurringDate.setDate(tempRecurringDate.getDate() + 1);
                    // Prevent infinite loop if tempRecurringDate somehow exceeds effectiveInstanceEndDate
                    if (tempRecurringDate.getTime() > effectiveInstanceEndDate.getTime() + (24 * 60 * 60 * 1000)) break;
                }
            }
          });
    }
  }

  // Convert search query to lowercase for case-insensitive search
  const lowerCaseSearchQuery = searchQuery.toLowerCase();


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

    let eventsForThisDay = eventsForMonth[dayKey] || [];

    // Apply search filter
    if (lowerCaseSearchQuery) {
        eventsForThisDay = eventsForThisDay.filter(event =>
            event.name.toLowerCase().includes(lowerCaseSearchQuery) ||
            (event.description && event.description.toLowerCase().includes(lowerCaseSearchQuery)) ||
            (event.address && event.address.toLowerCase().includes(lowerCaseSearchQuery)) // NEW: Search by address
        );
    }


    if (eventsForThisDay.length > 0) {
      // Sort events by start time for consistent display
      eventsForThisDay.sort((a, b) => {
          if (a.isAllDay && !b.isAllDay) return -1;
          if (!a.isAllDay && b.isAllDay) return 1;
          if (!a.startTime || !b.startTime) return 0;
          return a.startTime.localeCompare(b.startTime);
      });

      eventsForThisDay.forEach(event => {
        if (!event.name) return;

        const eventEl = document.createElement("div");
        eventEl.className = "event-entry";
        eventEl.classList.add(event.color || (event.isAllDay ? "teal" : "default"));

        const timeDisplay = event.isAllDay ? 'All-day' : displayTime(event.startTime || '');
        const tooltipTimeRange = event.isAllDay ? 'All-day' : (displayTime(event.startTime || '') + ' - ' + displayTime(event.endTime || ''));

        let eventTextContent = `${timeDisplay} ${event.name}`;
        let eventTooltip = `${event.name}`;
        if (event.address) {
            eventTooltip += `\nLocation: ${event.address}`;
        }
        eventTooltip += `\n${event.description || 'No description.'}\nStarts: ${displayTime(event.startTime || '00:00')} on ${displayDate(event.startDate)}\nEnds: ${displayTime(event.endTime || '23:59')} on ${displayDate(event.endDate)}`;

        // If the event spans multiple days, add visual indication
        const eventStartDate = new Date(event.startDate);
        const eventEndDate = new Date(event.endDate);
        if (eventStartDate.toDateString() !== eventEndDate.toDateString()) {
            eventTextContent = `Multi-day: ${event.name}`; // Simpler for display in small cell
        }


        eventEl.textContent = eventTextContent;
        eventEl.title = eventTooltip; // Improved tooltip

        eventEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Prevent day cell click when clicking event
            openModalForEditEvent(event, getEventStorageKey(event.startDate));
        });
        eventListDiv.appendChild(eventEl);
      });

      // Add event count badge for days with events
      const eventCount = eventsForThisDay.length; // Count visible events after filtering
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

// Helper to format date for tooltips (e.g., May 21, 2025)
function displayDate(dateString) {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
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
  const address = eventAddressInput.value.trim(); // NEW: Get address
  const startDate = eventStartDateInput.value;
  const startTime = eventStartTimeInput.value;
  const endDate = eventEndDateInput.value;
  const endTime = eventEndTimeInput.value;
  const isAllDay = eventAllDayCheckbox.checked;
  const repeat = eventRepeatSelect.value;
  const repeatEndDate = eventRepeatEndDateInput.value; // NEW: Get recurrence end date
  const color = eventColorSelect.value;
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

  // NEW: Validate recurrence end date if repeat is selected
  if (repeat !== 'none' && repeatEndDate) {
      const [repeatEndYear, repeatEndMonth, repeatEndDay] = repeatEndDate.split('-').map(Number);
      const repeatEndDateTime = new Date(repeatEndYear, repeatEndMonth - 1, repeatEndDay, 23, 59, 59);

      // Ensure recurrence end date is not before event start date
      // We check against the event's *actual* start date, not the start of the current displayed recurrence
      if (repeatEndDateTime < startDateTime) {
          alert("Recurrence end date cannot be before the event's start date.");
          return;
      }
  }


  const eventData = {
    id: editingEventId || generateId(),
    name,
    address, // NEW: Store address
    startDate, // Store as YYYY-MM-DD string
    startTime: isAllDay ? null : startTime,
    endDate,   // Store as YYYY-MM-DD string
    endTime: isAllDay ? null : endTime,
    isAllDay,
    repeat,
    repeatEndDate: repeat === 'none' ? null : repeatEndDate, // NEW: Store recurrence end date (null if no repeat)
    color,
    description,
  };

  const newEventStorageKey = getEventStorageKey(startDate);

  if (editingEventId) {
    // Editing an existing event: remove old entry, then add new
    let oldEventStorageKey = null;
    for (const key in events) {
        if (events.hasOwnProperty(key) && Array.isArray(events[key])) {
            const eventIndex = events[key].findIndex(ev => ev.id === editingEventId);
            if (eventIndex !== -1) {
                events[key].splice(eventIndex, 1);
                if (events[key].length === 0) {
                    delete events[key];
                }
                oldEventStorageKey = key;
                break;
            }
        }
    }

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
  renderCalendar(currentDate, eventSearchInput.value); // Re-render with current search query
};


deleteEventButton.onclick = () => {
    if (!confirm("Are you sure you want to delete this event?")) {
        return; // User cancelled deletion
    }

    if (!editingEventId) {
        console.warn("No event ID selected for deletion.");
        return;
    }

    let eventFoundAndDeleted = false;
    for (const key in events) {
        if (events.hasOwnProperty(key) && Array.isArray(events[key])) {
            const eventIndex = events[key].findIndex(ev => ev.id === editingEventId);
            if (eventIndex !== -1) {
                events[key].splice(eventIndex, 1);
                if (events[key].length === 0) {
                    delete events[key];
                }
                eventFoundAndDeleted = true;
                break;
            }
        }
    }

    if (eventFoundAndDeleted) {
        saveEvents();
    } else {
        console.warn("Could not find event to delete with ID:", editingEventId);
    }
    closeModal();
    renderCalendar(currentDate, eventSearchInput.value);
};


// NAVIGATION FUNCTIONS

document.getElementById("prevMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() - 1);
  renderCalendar(currentDate, eventSearchInput.value); // Pass search query
};

document.getElementById("nextMonth").onclick = () => {
  currentDate.setMonth(currentDate.getMonth() + 1);
  renderCalendar(currentDate, eventSearchInput.value); // Pass search query
};

todayButton.onclick = () => {
  currentDate = new Date(); // Reset to today's date
  renderCalendar(currentDate, eventSearchInput.value); // Pass search query
};

eventSearchInput.addEventListener('input', (e) => {
    renderCalendar(currentDate, e.target.value.trim());
});

// NEW: Event listener for "Go to Date" input
goToDateInput.addEventListener('change', (e) => {
    const [year, month] = e.target.value.split('-').map(Number);
    if (year && month) {
        currentDate.setFullYear(year, month - 1, 1); // Set to first day of selected month
        renderCalendar(currentDate, eventSearchInput.value);
    }
});


// INITIALIZATION
renderCalendar(currentDate);
