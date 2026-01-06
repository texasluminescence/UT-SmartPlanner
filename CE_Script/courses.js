const courseTableBody = document.querySelector('.courseTable tbody');
const prevButton = document.querySelector('.navigation button:first-child');
const nextButton = document.querySelector('.navigation button:last-child');


let currentPage = 0;
const coursesPerPage = 6; 
let courseData = [];
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

function renderCoursesTable() {
    // calculate pagination
    const startIndex = currentPage * coursesPerPage;
    const endIndex = Math.min(startIndex + coursesPerPage, courseData.length);
    const currentCourses = courseData.slice(startIndex, endIndex);
    
    // clears rows
    courseTableBody.innerHTML = '';
    
    // add new rows
    currentCourses.forEach(course => {
        courseTableBody.innerHTML += renderCourseRow(course);
    });
    
    
    updatePaginationButtons();
    // reflect schedule state on visible Add buttons
    updateAddButtonsFromSchedule();
}

// mark buttons for a course as added
function idMatch(a, b) {
    if (a === b) return true;
    const an = Number(a);
    const bn = Number(b);
    if (!Number.isNaN(an) && !Number.isNaN(bn) && an === bn) return true;
    return false;
}

function markCourseAsAdded(uniqueId) {
    const btns = document.querySelectorAll('.add-btn');
    btns.forEach(b => {
        if (idMatch(b.dataset.id, String(uniqueId))) {
            b.textContent = 'Added';
            b.classList.add('added');
            b.disabled = true;
        }
    });
}

// revert buttons for a course to Add
function markCourseAsRemoved(uniqueId) {
    const btns = document.querySelectorAll('.add-btn');
    btns.forEach(b => {
        if (idMatch(b.dataset.id, String(uniqueId))) {
            b.textContent = 'Add';
            b.classList.remove('added');
            b.disabled = false;
        }
    });
}

// update all add buttons based on current schedule
function updateAddButtonsFromSchedule() {
    const schedule = JSON.parse(localStorage.getItem('userSchedule') || '[]');
    const allBtns = document.querySelectorAll('.add-btn');
    allBtns.forEach(b => {
        const id = String(b.dataset.id);
        const exists = schedule.some(s => idMatch(id, String(s.id)));
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
    
    prevButton.disabled = currentPage === 0;
    
    
    const totalPages = Math.ceil(courseData.length / coursesPerPage);
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
        'IDAI+': 'index.html'
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
    fetch('courses.json')
    .then(response => response.json())
    .then(data => {
        // keep course data in a global array for paging and lookups
        courseData = data;
        window.courseData = data;
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

    // pick a random color class for course cards, avoiding colors in excludeColors when possible
    function getRandomColor(excludeColors = []) {
        const colors = ['red', 'blue', 'purple', 'green', 'orange', 'teal'];
        const excludeSet = new Set((excludeColors || []).filter(Boolean));
        const available = colors.filter(c => !excludeSet.has(c));
        if (available.length > 0) return available[Math.floor(Math.random() * available.length)];
        // if all colors are excluded, try to avoid the most recent color in schedule
        const schedule = JSON.parse(localStorage.getItem('userSchedule') || '[]');
        const lastColor = (schedule.length && schedule[schedule.length - 1].color) || null;
        const alt = colors.filter(c => c !== lastColor);
        return alt[Math.floor(Math.random() * alt.length)];
    }

    // handle clicks on Add buttons (auto-place based on course days/hour)
    document.addEventListener('click', function(e) {
        if (!e.target.matches('.add-btn')) return;
        const courseId = e.target.dataset.id;
        const course = (window.courseData || []).find(c => String(c.unique) === String(courseId) || String(c.id) === String(courseId));
        if (!course) return alert('Could not find course data.');

        const schedule = JSON.parse(localStorage.getItem('userSchedule') || '[]');

        const days = parseDays(course.days || '');
        const row = hourToRow(course.hour || '');

        const addedSlots = [];

        if (days.length > 0 && row) {
            // determine which slots we can add (handle conflicts first)
            const planned = [];
            days.forEach(day => {
                // skip if same course already added to this slot
                if (schedule.find(s => String(s.id) === String(course.unique) && s.day === day && s.row === row)) return;

                const conflict = schedule.find(s => s.day === day && s.row === row);
                if (conflict) {
                    const replace = confirm(`Time slot on ${['Mon','Tue','Wed','Thu','Fri'][day-1]} at ${course.hour} is occupied by ${conflict.course_name}. Replace?`);
                    if (!replace) return; // skip this day
                    // remove conflict entry
                    const idx = schedule.findIndex(s => s.day === day && s.row === row);
                    if (idx !== -1) schedule.splice(idx, 1);
                }

                planned.push({ day, row });
            });

            if (planned.length > 0) {
                // choose a color not currently used in schedule
                const usedColors = schedule.map(s => s.color).filter(Boolean);
                const color = getRandomColor(usedColors);
                planned.forEach(slot => {
                    schedule.push({
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
            const free = findFirstFreeSlot(schedule);
            if (!free) return alert('No free slots available to place this course.');
            const usedColors = schedule.map(s => s.color).filter(Boolean);
            const color = getRandomColor(usedColors);
            schedule.push({
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

        localStorage.setItem('userSchedule', JSON.stringify(schedule));
        // signal other pages that schedule was updated
        try { localStorage.setItem('userScheduleUpdated', String(Date.now())); } catch (e) {}
        // update Add buttons on this page
        if (addedSlots.length > 0) {
            markCourseAsAdded(course.unique);
            updateAddButtonsFromSchedule();
                // success: silently update UI (no alert)
        } else {
                alert('Course was not added to any slots.');
        }
    });

    // listen for storage changes in other tabs and update Add buttons
    window.addEventListener('storage', function(e) {
        if (e.key === 'userSchedule' || e.key === 'userScheduleUpdated') {
            updateAddButtonsFromSchedule();
        }
    });
});