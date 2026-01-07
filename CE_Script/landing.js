document.addEventListener('DOMContentLoaded', function() {
    // Handle sidebar item selection and navigation
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
            // Remove selected class from all items
            sidebarItems.forEach(i => i.classList.remove('selected'));
            // Add selected class to clicked item
            this.classList.add('selected');

            const text = this.textContent.trim().toUpperCase();
            const dest = navMap[text];
            if (dest) {
                window.location.href = dest;
            }
        });
    });


    const closeButton = document.querySelector('.x-btn');
    if (closeButton) closeButton.addEventListener('click', function() {
        console.log('Close button clicked');
        // window.close(); 
    });

    // add small generic sidebar click handler for navigation on pages that use .sidebar-item anchors
    document.querySelectorAll('.sidebar-item').forEach(it => {
        it.addEventListener('click', function() {
            const text = this.textContent.trim().toUpperCase();
            if (text === 'SCHEDULES' || text === 'COURSE SCHEDULE') {
                window.location.href = 'landing.html';
            } else if (text === 'COURSES') {
                window.location.href = 'courses.html';
            }
        });
    });

   
    const helpButton = document.querySelector('.help-btn');
    helpButton.addEventListener('click', function() {
        console.log('Help button clicked');
        
    });

    // progress visualization removed
    
    
    function addCourse(dayColumn, rowPosition, title, instructor, id, color, saveToSchedule = false) {
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return; 

        const courseCard = document.createElement('div');
        courseCard.className = `course-card ${color}`;
        courseCard.style.gridColumn = dayColumn;
        courseCard.style.gridRow = rowPosition;
        
        courseCard.innerHTML = `
            <button class="remove-btn" title="Remove course">×</button>
            <div class="course-title">${title}</div>
            <div class="course-instructor">${instructor}</div>
            <div class="course-id">${id}</div>
        `;
        
        coursesGrid.appendChild(courseCard);

        if (saveToSchedule) {
            // persist to the currently selected schedule
            const store = getUserSchedules();
            const schedule = store.schedules.find(s => s.id === store.selectedId) || store.schedules[0];
            schedule.items.push({ day: dayColumn, row: rowPosition, course_name: title, instructor, id, color });
            saveUserSchedules(store);
        }
    }

    /* ========== Multi-schedule support ========== */
    // Helper: ensure backward compatibility and return schedules object
    function getUserSchedules() {
        try {
            const raw = localStorage.getItem('userSchedules');
            if (raw) return JSON.parse(raw);
            // migrate old single schedule key if present
            const legacy = JSON.parse(localStorage.getItem('userSchedule') || 'null');
            if (legacy && Array.isArray(legacy)) {
                const migrated = {
                    schedules: [ { id: 'default', name: 'Schedule 1', items: legacy } ],
                    selectedId: 'default'
                };
                localStorage.setItem('userSchedules', JSON.stringify(migrated));
                localStorage.removeItem('userSchedule');
                return migrated;
            }
        } catch (e) {
            console.error('Failed to parse schedules from localStorage', e);
        }
        // default empty state
        return { schedules: [ { id: 'default', name: 'Schedule 1', items: [] } ], selectedId: 'default' };
    }

    function saveUserSchedules(obj) {
        localStorage.setItem('userSchedules', JSON.stringify(obj));
        try { localStorage.setItem('userSchedulesUpdated', String(Date.now())); } catch (e) {}
    }

    function renderScheduleOptions() {
        const sel = document.getElementById('schedule-select');
        if (!sel) return;
        const store = getUserSchedules();
        sel.innerHTML = '';
        store.schedules.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = s.name;
            sel.appendChild(opt);
        });
        sel.value = store.selectedId;
    }

    function loadSelectedSchedule() {
        const store = getUserSchedules();
        const schedule = store.schedules.find(s => s.id === store.selectedId) || store.schedules[0];

        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;
        coursesGrid.innerHTML = '';
        schedule.items.forEach(item => {
            addCourse(item.day, item.row, item.course_name, item.instructor, item.id, item.color || 'red');
        });
    }

    function createNewSchedule(name, copyFromId) {
        const store = getUserSchedules();
        const id = 's_' + Date.now();
        const items = copyFromId ? (store.schedules.find(s => s.id === copyFromId)?.items || []) : [];
        const newSched = { id, name: name || `Schedule ${store.schedules.length + 1}`, items: JSON.parse(JSON.stringify(items)) };
        store.schedules.push(newSched);
        store.selectedId = id;
        saveUserSchedules(store);
        renderScheduleOptions();
        loadSelectedSchedule();
    }

    function deleteSchedule(id) {
        const store = getUserSchedules();
        if (store.schedules.length === 1) {
            if (!confirm('Deleting the only schedule will clear it. Continue?')) return;
            store.schedules[0].items = [];
            store.schedules[0].name = 'Schedule 1';
            store.selectedId = store.schedules[0].id;
            saveUserSchedules(store);
            renderScheduleOptions();
            loadSelectedSchedule();
            return;
        }
        if (!confirm('Are you sure you want to delete this schedule?')) return;
        store.schedules = store.schedules.filter(s => s.id !== id);
        if (!store.schedules.find(s => s.id === store.selectedId)) store.selectedId = store.schedules[0].id;
        saveUserSchedules(store);
        renderScheduleOptions();
        loadSelectedSchedule();
    }

    function renameSchedule(id, newName) {
        if (!newName) return;
        const store = getUserSchedules();
        const s = store.schedules.find(x => x.id === id);
        if (!s) return;
        s.name = newName;
        saveUserSchedules(store);
        renderScheduleOptions();
    }

    // wire up schedule controls and replace earlier single-schedule loading logic
    (function initSchedulesAndHandlers() {
        renderScheduleOptions();
        loadSelectedSchedule();

        const sel = document.getElementById('schedule-select');
        if (sel) {
            sel.addEventListener('change', function() {
                const store = getUserSchedules();
                store.selectedId = this.value;
                saveUserSchedules(store);
                loadSelectedSchedule();
            });
        }

        const newBtn = document.getElementById('new-schedule-btn');
        if (newBtn) newBtn.addEventListener('click', function() {
            const name = prompt('Name for new schedule?', `Schedule ${getUserSchedules().schedules.length + 1}`);
            createNewSchedule(name);
        });

        const dupBtn = document.getElementById('duplicate-schedule-btn');
        if (dupBtn) dupBtn.addEventListener('click', function() {
            const store = getUserSchedules();
            const cur = store.schedules.find(s => s.id === store.selectedId);
            createNewSchedule(cur ? `Copy of ${cur.name}` : undefined, cur?.id);
        });

        const renameBtn = document.getElementById('rename-schedule-btn');
        if (renameBtn) renameBtn.addEventListener('click', function() {
            const store = getUserSchedules();
            const cur = store.schedules.find(s => s.id === store.selectedId);
            const newName = prompt('Rename schedule to:', cur?.name || 'Schedule');
            if (newName) renameSchedule(store.selectedId, newName);
        });

        const delBtn = document.getElementById('delete-schedule-btn');
        if (delBtn) delBtn.addEventListener('click', function() {
            const store = getUserSchedules();
            deleteSchedule(store.selectedId);
        });

        // allow clicking the remove button on a course-card to remove all instances of that course within the selected schedule
        const coursesGrid = document.querySelector('.courses-grid');
        if (!coursesGrid) return;
        coursesGrid.addEventListener('click', function(e) {
            const btn = e.target.closest('.remove-btn');
            if (!btn) return; // ignore clicks that are not on the remove button
            e.stopPropagation();
            const card = btn.closest('.course-card');
            if (!card) return;
            if (!confirm('Remove ALL instances of this course from your schedule?')) return;
            const id = card.querySelector('.course-id')?.textContent;
            // remove from selected schedule only
            const store = getUserSchedules();
            const schedule = store.schedules.find(s => s.id === store.selectedId) || store.schedules[0];
            schedule.items = schedule.items.filter(s => String(s.id) !== String(id));
            saveUserSchedules(store);
            // remove all course cards in the grid that match this id
            const allCards = coursesGrid.querySelectorAll('.course-card');
            allCards.forEach(c => {
                const cid = c.querySelector('.course-id')?.textContent;
                if (String(cid) === String(id)) c.remove();
            });
        });
    })();

    // listen for storage changes triggered in other tabs/windows and update UI
    window.addEventListener('storage', function(e) {
        if (e.key === 'userSchedules' || e.key === 'userSchedulesUpdated' || e.key === 'userSchedule' || e.key === 'userScheduleUpdated') {
            renderScheduleOptions();
            loadSelectedSchedule();
        }
    });


    // adding course practice
    // addCourse(3, 2, 'NEW COURSE', 'Smith, John', '12345', 'blue');
});
