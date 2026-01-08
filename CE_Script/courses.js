const courseTableBody = document.querySelector('.courseTable tbody');
const prevButton = document.querySelector('.navigation button:first-child');
const nextButton = document.querySelector('.navigation button:last-child');


let currentPage = 0;
const coursesPerPage = 6; 
let courseData = [];
let filteredData = []; // data after applying major filter
let flags_dict = {
    "Independent Inquiry": "II",
    "Writing": "WR",
    "Global Cultures": "GC",
    "Cultural Diversity": "CD",
    "Quantitative Reasoning": "QR",
    "Ethics": "E"
};

// star rating for each course
function renderStars(count) {
    if (count > 0 && count <= 5) {
        return count + '       ' + '★'.repeat(count);
    }
    return '';
}

function renderFlags(flags) {
    if (!flags) {
        return "";
    }
    flags = flags.split("\n");

    for (let i = 0; i < flags.length; i++) {
        flags[i] = flags_dict[flags[i]];
    }

    return flags.map(flag => `<span class="flag">${flag}</span>`).join('');
}

// converts course object to HTML table row
function renderCourseRow(course) {
    let rowClass = 'courseRow';

   // picks color for course
    if (course.status === 'selected') {
        rowClass = 'courseRowSelected';
    } else if (course.status === 'potential') {
        rowClass = 'courseRowPotential';
    } else if (course.status === 'conflict') {
        rowClass = 'courseRowConflict';
    }

    // course data
    return `
        <tr class="${rowClass}" data-id="${course.unique}">
            <td>${course.unique}</td>
            <td>${course.course_name}</td>
            <td>${course.instructor}</td>
            <td>
                ${renderFlags(course.flags)}
            </td>
            <td><button class="add-btn" data-id="${course.unique}">Add</button></td>
            <td>${renderStars(course.professor_rating)}</td>
        </tr>
    `;
}

// helper to parse days string into day numbers (1=Mon .. 5=Fri)
function parseDays(daysStr) {
    if (!daysStr) return [];
    let s = daysStr.toUpperCase().replace(/\s+/g, '');
    const days = [];
    // handle TTH (Tue/Thu) explicitly
    if (s.includes('TTH')) {
        days.push(2, 4);
        s = s.replace(/TTH/g, '');
    }
    // handle TH token for Thursday
    if (s.includes('TH')) {
        days.push(4);
        s = s.replace(/TH/g, '');
    }
    // now remaining single-letter tokens
    if (s.includes('M')) days.push(1);
    if (s.includes('T')) days.push(2);
    if (s.includes('W')) days.push(3);
    if (s.includes('R')) days.push(4);
    if (s.includes('F')) days.push(5);
    return Array.from(new Set(days)).sort((a,b)=>a-b);
}

// map start time to a row index in the schedule grid
function hourToRow(hourStr) {
    if (!hourStr) return null;
    const parts = hourStr.split('-');
    if (!parts || parts.length === 0) return null;
    const start = parts[0].trim().toLowerCase();
    const m = start.match(/(\d{1,2}):(\d{2})/);
    if (!m) return null;
    const hour = parseInt(m[1], 10);
    const min = parseInt(m[2], 10);
    // convert to minutes since midnight (assume a.m./p.m. in string)
    const isPM = /p\.m\.|pm/.test(start);
    let totalHour = hour % 12;
    if (isPM) totalHour += 12;
    const minutes = totalHour * 60 + min;

    // time buckets based on dataset common start times
    // 8:00 -> row 1, 9:30 -> row 2, 11:00 -> row 3, 12:30 -> row 4, 2:00 -> row 5, 3:30 -> row 6
    if (minutes <= (8*60 + 30)) return 1;
    if (minutes <= (9*60 + 59)) return 2;
    if (minutes <= (11*60 + 59)) return 3;
    if (minutes <= (13*60 + 30)) return 4;
    if (minutes <= (15*60 + 0)) return 5;
    return 6;
}

// find first free slot (day 1..5, row 1..6)
function findFirstFreeSlot(schedule) {
    for (let r = 1; r <= 6; r++) {
        for (let d = 1; d <= 5; d++) {
            if (!schedule.find(s => s.day === d && s.row === r)) {
                return { day: d, row: r };
            }
        }
    }
    return null;
}

function renderCoursesTable() {
    // ensure currentPage is within valid range for filtered data
    const totalPages = Math.ceil(filteredData.length / coursesPerPage) || 1;
    if (currentPage >= totalPages) currentPage = Math.max(0, totalPages - 1);

    // calculate pagination
    const startIndex = currentPage * coursesPerPage;
    const endIndex = Math.min(startIndex + coursesPerPage, filteredData.length);
    const currentCourses = filteredData.slice(startIndex, endIndex);

    // clears rows
    courseTableBody.innerHTML = '';

    // determine per-course status (selected, conflict)
    const { schedule } = getSelectedScheduleItems();
    currentCourses.forEach(course => {
        // default status
        course.status = course.status || '';
        // if course is already in the selected schedule -> selected
        const inSchedule = schedule.items.some(s => idMatch(s.id, String(course.unique) || String(course.id)));
        if (inSchedule) {
            course.status = 'selected';
        } else {
            // attempt to detect time overlap
            const days = parseDays(course.days || '');
            const row = hourToRow(course.hour || '');
            let conflict = false;
            if (days.length > 0 && row) {
                conflict = schedule.items.some(s => days.includes(Number(s.day)) && Number(s.row) === Number(row));
            }
            course.status = conflict ? 'conflict' : '';
        }
        courseTableBody.innerHTML += renderCourseRow(course);
    });

    // show/hide 'no results' message
    const noEl = document.getElementById('noResults');
    if (noEl) {
        if (filteredData.length === 0) noEl.style.display = 'block';
        else noEl.style.display = 'none';
    }

    updatePaginationButtons();
    // reflect schedule state on visible Add buttons
    updateAddButtonsFromSchedule();
}

// helper to compare IDs robustly (strings/numbers)
function idMatch(a, b) {
    return String(a) === String(b);
}

// revert buttons for a course to Add and reset row class
function markCourseAsRemoved(uniqueId) {
    const btns = document.querySelectorAll('.add-btn');
    btns.forEach(b => {
        if (idMatch(b.dataset.id, String(uniqueId))) {
            b.textContent = 'Add';
            b.classList.remove('added');
            b.disabled = false;
        }
    });

    // update table row appearance
    const rows = document.querySelectorAll('.courseTable tr[data-id]');
    rows.forEach(r => {
        const id = r.getAttribute('data-id');
        if (idMatch(id, String(uniqueId))) {
            r.classList.remove('courseRowSelected', 'courseRowConflict', 'courseRowPotential');
            r.classList.add('courseRow');
        }
    });
}

// set buttons for a course to Added and mark row as selected (green)
function markCourseAsAdded(uniqueId) {
    const btns = document.querySelectorAll('.add-btn');
    btns.forEach(b => {
        if (idMatch(b.dataset.id, String(uniqueId))) {
            b.textContent = 'Added';
            b.classList.add('added');
            b.disabled = true;
        }
    });

    // mark the table row as selected
    const rows = document.querySelectorAll('.courseTable tr[data-id]');
    rows.forEach(r => {
        const id = r.getAttribute('data-id');
        if (idMatch(id, String(uniqueId))) {
            r.classList.remove('courseRowConflict', 'courseRowPotential', 'courseRow');
            r.classList.add('courseRowSelected');
        }
    });
}

// update all add buttons based on current schedule
function getUserSchedulesStore() {
    const DEFAULT = { schedules: [ { id: 'default', name: 'Schedule 1', items: [] } ], selectedId: 'default' };
    try {
        const raw = localStorage.getItem('userSchedules');
        if (raw) {
            const parsed = JSON.parse(raw);
            // validate shape
            if (parsed && Array.isArray(parsed.schedules)) return parsed;
            // if parsed contains schedules but not as array, attempt to coerce
            if (parsed && parsed.schedules && typeof parsed.schedules === 'object') {
                const coerced = { schedules: Array.isArray(parsed.schedules) ? parsed.schedules : Object.values(parsed.schedules), selectedId: parsed.selectedId || (Array.isArray(parsed.schedules) && parsed.schedules[0] && parsed.schedules[0].id) };
                return coerced;
            }
            // otherwise fall through to migrate legacy if possible
        }
        const legacy = JSON.parse(localStorage.getItem('userSchedule') || 'null');
        if (legacy && Array.isArray(legacy)) {
            const migrated = { schedules: [ { id: 'default', name: 'Schedule 1', items: legacy } ], selectedId: 'default' };
            localStorage.setItem('userSchedules', JSON.stringify(migrated));
            localStorage.removeItem('userSchedule');
            return migrated;
        }
    } catch (e) {
        console.warn('Failed to parse schedules from localStorage, resetting to default', e);
        // clear malformed key to recover gracefully
        try { localStorage.removeItem('userSchedules'); } catch (err) {}
        return DEFAULT;
    }
    return DEFAULT;
}

function getSelectedScheduleItems() {
    const store = getUserSchedulesStore() || { schedules: [] };
    const schedulesArr = Array.isArray(store.schedules) && store.schedules.length ? store.schedules : [ { id: 'default', name: 'Schedule 1', items: [] } ];
    const schedule = schedulesArr.find(s => s.id === store.selectedId) || schedulesArr[0];
    return { store: { schedules: schedulesArr, selectedId: store.selectedId || schedulesArr[0].id }, schedule };
}

function updateAddButtonsFromSchedule() {
    const { schedule } = getSelectedScheduleItems();
    const allBtns = document.querySelectorAll('.add-btn');
    allBtns.forEach(b => {
        const id = String(b.dataset.id);
        const exists = schedule.items.some(s => idMatch(id, String(s.id)));
        if (exists) {
            b.textContent = 'Added';
            b.classList.add('added');
            b.disabled = true;
        } else {
            b.textContent = 'Add';
            b.classList.remove('added');
            b.disabled = false;
        }
    });
}

function updatePaginationButtons() {
    
        const totalPages = Math.ceil(filteredData.length / coursesPerPage) || 0;
        prevButton.disabled = currentPage === 0 || totalPages === 0;

        nextButton.disabled = currentPage >= totalPages - 1 || totalPages === 0;

        prevButton.style.opacity = prevButton.disabled ? 0.5 : 1;
        nextButton.style.opacity = nextButton.disabled ? 0.5 : 1;
}

// redraw table if prev button clicked
prevButton.addEventListener('click', function() {
    if (currentPage > 0) {
        currentPage--;
        renderCoursesTable();
    }
});

// redraw table if next button clicked
nextButton.addEventListener('click', function() {
    const totalPages = Math.ceil(courseData.length / coursesPerPage);
    if (currentPage < totalPages - 1) {
        currentPage++;
        renderCoursesTable();
    }
});


document.addEventListener('DOMContentLoaded', function() {
    // sidebar navigation mapping (same as landing)
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const navMap = {
        'COURSES': 'courses.html',
        'SCHEDULES': 'landing.html',
        'COURSE SCHEDULE': 'landing.html',
        'MY UT': 'index.html',
        'IDAI+': 'idai.html'
    };
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            sidebarItems.forEach(i => i.classList.remove('selected'));
            this.classList.add('selected');
            const text = this.textContent.trim().toUpperCase();
            const dest = navMap[text];
            if (dest) window.location.href = dest;
        });
    });

    // generic sidebar clicks to navigate to schedule or courses for consistency across pages
    document.querySelectorAll('.sidebar-item').forEach(it => {
        it.addEventListener('click', function() {
            const text = this.textContent.trim().toUpperCase();
            if (text === 'SCHEDULES') {
                window.location.href = 'schedules.html';
            } else if (text === 'COURSE SCHEDULE') {
                window.location.href = 'landing.html';
            } else if (text === 'COURSES') {
                window.location.href = 'courses.html';
            }
        });
    });
    fetch('courses.json')
    .then(response => response.json())
    .then(data => {
        // keep course data in a global array for paging and lookups
        courseData = data;
        window.courseData = data;
        // initialize filtered data and populate filters
        filteredData = courseData.slice();
        populateMajorFilter();
        renderCoursesTable();
    })
    .catch(error => console.error('Error loading courses:', error));

    
    // keyboard shortcuts to navigate between pages
    document.addEventListener('keydown', function(e) {
        // Arrow left for previous page
        if (e.key === 'ArrowLeft' && !prevButton.disabled) {
            prevButton.click();
        }
        // Arrow right for next page
        else if (e.key === 'ArrowRight' && !nextButton.disabled) {
            nextButton.click();
        }
    });

    // populate majors filter UI and set up live search
    function populateMajorFilter() {
        const select = document.getElementById('majorFilter');
        if (!select) return;
        // collect unique majors
        const majors = new Set();
        courseData.forEach(c => {
            const m = (c.major || '').trim();
            if (!m) return;
            majors.add(m);
        });
        const sorted = Array.from(majors).sort();
        // clear existing options except the ALL option
        select.innerHTML = '<option value="ALL">All</option>';
        sorted.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m;
            opt.textContent = m;
            select.appendChild(opt);
        });

        // update filters when major changes
        select.addEventListener('change', function() {
            currentPage = 0;
            applyFilters();
        });

        // wire up the search input to filter as the user types
        const searchInput = document.getElementById('courseSearch');
        const clearBtn = document.getElementById('clearSearch');
        if (searchInput) {
            searchInput.addEventListener('input', function() {
                currentPage = 0;
                applyFilters();
                if (clearBtn) clearBtn.style.display = this.value ? 'block' : 'none';
            });
            // initialize clear visibility
            if (clearBtn) clearBtn.style.display = searchInput.value ? 'block' : 'none';
            if (clearBtn) {
                clearBtn.addEventListener('click', function() {
                    searchInput.value = '';
                    clearBtn.style.display = 'none';
                    currentPage = 0;
                    applyFilters();
                    searchInput.focus();
                });
            }
        }
    }

    // apply major + search filters and re-render table
    function applyFilters() {
        const select = document.getElementById('majorFilter');
        const searchInput = document.getElementById('courseSearch');
        const majorVal = select ? select.value : 'ALL';
        let data = courseData.slice();
        if (majorVal && majorVal !== 'ALL') {
            data = data.filter(c => (c.major || '').trim() === majorVal);
        }
        const q = searchInput ? searchInput.value.trim().toLowerCase() : '';
        if (q) {
            data = data.filter(c => {
                const idStr = String(c.unique || c.id || '').toLowerCase();
                const title = (c.course_name || '').toLowerCase();
                const prof = (c.instructor || '').toLowerCase();
                return idStr.includes(q) || title.includes(q) || prof.includes(q);
            });
        }
        filteredData = data;
        renderCoursesTable();
    }

    // (helpers moved to module scope to support renderCoursesTable)
    

    // pick a random color class for course cards, avoiding colors in excludeColors when possible
    function getRandomColor(excludeColors = []) {
        const colors = ['red', 'blue', 'purple', 'green', 'orange', 'teal'];
        const excludeSet = new Set((excludeColors || []).filter(Boolean));
        const available = colors.filter(c => !excludeSet.has(c));
        if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
        // if all colors are excluded, try to avoid the most recent color in schedule
        const { schedule } = getSelectedScheduleItems();
        const lastColor = (schedule.items.length && schedule.items[schedule.items.length - 1].color) || null;
        const alt = colors.filter(c => c !== lastColor);
        return alt[Math.floor(Math.random() * alt.length)];
    }

    // handle clicks on Add buttons (auto-place based on course days/hour)
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.add-btn')) return;
        const courseId = e.target.dataset.id;
        const course = (window.courseData || []).find(c => String(c.unique) === String(courseId) || String(c.id) === String(courseId));
        if (!course) return alert('Could not find course data.');

        const { store, schedule } = getSelectedScheduleItems();

        const days = parseDays(course.days || '');
        const row = hourToRow(course.hour || '');

        const addedSlots = [];

        if (days.length > 0 && row) {
            // determine which slots we can add (handle conflicts first)
            const planned = [];
            days.forEach(day => {
                // skip if same course already added to this slot
                if (schedule.items.find(s => String(s.id) === String(course.unique) && s.day === day && s.row === row)) return;

                const conflict = schedule.items.find(s => s.day === day && s.row === row);
                if (conflict) {
                    const replace = confirm(`Time slot on ${['Mon','Tue','Wed','Thu','Fri'][day-1]} at ${course.hour} is occupied by ${conflict.course_name}. Replace?`);
                    if (!replace) return; // skip this day
                    // remove conflict entry
                    const idx = schedule.items.findIndex(s => s.day === day && s.row === row);
                    if (idx !== -1) schedule.items.splice(idx, 1);
                }

                planned.push({ day, row });
            });

            if (planned.length > 0) {
                // choose a color not currently used in schedule
                const usedColors = schedule.items.map(s => s.color).filter(Boolean);
                const color = getRandomColor(usedColors);
                planned.forEach(slot => {
                    schedule.items.push({
                        id: course.unique,
                        unique: course.unique,
                        course_name: course.course_name,
                        instructor: course.instructor,
                        day: slot.day,
                        row: slot.row,
                        color: color
                    });
                    addedSlots.push({day: slot.day, row: slot.row});
                });
            }
        } else {
            // fallback: find first free slot
            const free = findFirstFreeSlot(schedule.items);
            if (!free) return alert('No free slots available to place this course.');
            const usedColors = schedule.items.map(s => s.color).filter(Boolean);
            const color = getRandomColor(usedColors);
            schedule.items.push({
                id: course.unique,
                unique: course.unique,
                course_name: course.course_name,
                instructor: course.instructor,
                day: free.day,
                row: free.row,
                color: color
            });
            addedSlots.push({day: free.day, row: free.row});
        }

        // persist back to storage under userSchedules
        try {
            localStorage.setItem('userSchedules', JSON.stringify(store));
            localStorage.setItem('userSchedulesUpdated', String(Date.now()));
        } catch (e) { console.error('Failed to save schedule', e); }
        // update Add buttons on this page
        if (addedSlots.length > 0) {
            markCourseAsAdded(course.unique);
            updateAddButtonsFromSchedule();
                // success: silently update UI (no alert)
        } else {
                alert('Course was not added to any slots.');
        }
    });

    // listen for storage changes in other tabs and update UI (support userSchedules)
    window.addEventListener('storage', function(e) {
        if (e.key === 'userSchedules' || e.key === 'userSchedulesUpdated' || e.key === 'userSchedule' || e.key === 'userScheduleUpdated') {
            updateAddButtonsFromSchedule();
            // re-render table so conflicts (row color) update to reflect selected schedule
            renderCoursesTable();
        }
    });
});