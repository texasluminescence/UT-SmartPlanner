document.addEventListener('DOMContentLoaded', function() {
    let currentScheduleIndex = 0;
    let schedules = [];

    // Sidebar navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');
    const navMap = {
        'COURSES': 'courses.html',
        'SCHEDULES': 'schedules.html',
        'COURSE SCHEDULE': 'landing.html',
        'MY UT': 'index.html',
        'IDAI+': 'index.html'
    };

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            const text = this.textContent.trim().toUpperCase();
            const dest = navMap[text];
            if (dest) window.location.href = dest;
        });
    });

    // Load schedules from localStorage
    function loadSchedules() {
        try {
            const raw = localStorage.getItem('userSchedules');
            if (raw) {
                const store = JSON.parse(raw);
                schedules = store.schedules || [];
                const selectedId = store.selectedId;
                currentScheduleIndex = schedules.findIndex(s => s.id === selectedId);
                if (currentScheduleIndex === -1) currentScheduleIndex = 0;
            } else {
                schedules = [{ id: 'default', name: 'Schedule 1', items: [] }];
            }
        } catch (e) {
            console.error('Failed to load schedules', e);
            schedules = [{ id: 'default', name: 'Schedule 1', items: [] }];
        }
        renderCurrentSchedule();
    }

    // Render the current schedule
    function renderCurrentSchedule() {
        if (schedules.length === 0) return;

        const schedule = schedules[currentScheduleIndex];
        document.getElementById('current-schedule-name').textContent = schedule.name;
        document.getElementById('schedule-counter').textContent = 
            `${currentScheduleIndex + 1} / ${schedules.length}`;

        // Update navigation buttons
        document.getElementById('prev-schedule').disabled = currentScheduleIndex === 0;
        document.getElementById('next-schedule').disabled = currentScheduleIndex === schedules.length - 1;

        // Render schedule grid
        const grid = document.getElementById('schedule-grid');
        grid.innerHTML = '';

        // Group courses by day (1-5 = Mon-Fri)
        const dayColumns = [[], [], [], [], []];
        schedule.items.forEach(item => {
            const dayIndex = item.day - 1;
            if (dayIndex >= 0 && dayIndex < 5) {
                dayColumns[dayIndex].push(item);
            }
        });

        // Create columns for each day
        dayColumns.forEach(courses => {
            const column = document.createElement('div');
            column.className = 'day-column';
            
            courses.forEach(course => {
                const card = document.createElement('div');
                card.className = 'course-card';
                card.style.backgroundColor = getCourseColor(course.color);
                card.innerHTML = `
                    <p class="course-title">${course.course_name || 'Untitled'}</p>
                    <p class="instructor">${course.instructor || 'TBA'}</p>
                    <p class="course-code">${course.unique || course.id || ''}</p>
                `;
                column.appendChild(card);
            });

            grid.appendChild(column);
        });
    }

    // Helper to get color
    function getCourseColor(color) {
        const colorMap = {
            'red': '#ff6b6b',
            'blue': '#4dabf7',
            'purple': '#9775fa',
            'green': '#51cf66',
            'orange': '#ff922b',
            'teal': '#20c997'
        };
        return colorMap[color] || '#4dabf7';
    }

    // Navigation buttons
    document.getElementById('prev-schedule').addEventListener('click', function() {
        if (currentScheduleIndex > 0) {
            currentScheduleIndex--;
            updateSelectedSchedule();
            renderCurrentSchedule();
        }
    });

    document.getElementById('next-schedule').addEventListener('click', function() {
        if (currentScheduleIndex < schedules.length - 1) {
            currentScheduleIndex++;
            updateSelectedSchedule();
            renderCurrentSchedule();
        }
    });

    // Update selected schedule in localStorage
    function updateSelectedSchedule() {
        try {
            const raw = localStorage.getItem('userSchedules');
            const store = raw ? JSON.parse(raw) : { schedules, selectedId: schedules[0].id };
            store.selectedId = schedules[currentScheduleIndex].id;
            localStorage.setItem('userSchedules', JSON.stringify(store));
        } catch (e) {
            console.error('Failed to update schedule', e);
        }
    }

    // Action buttons
    document.getElementById('new-sched-btn').addEventListener('click', function() {
        const name = prompt('Name for new schedule?', `Schedule ${schedules.length + 1}`);
        if (!name) return;
        
        const newSchedule = {
            id: 's_' + Date.now(),
            name: name,
            items: []
        };
        schedules.push(newSchedule);
        currentScheduleIndex = schedules.length - 1;
        saveSchedules();
        renderCurrentSchedule();
    });

    document.getElementById('duplicate-btn').addEventListener('click', function() {
        const current = schedules[currentScheduleIndex];
        const duplicate = {
            id: 's_' + Date.now(),
            name: `Copy of ${current.name}`,
            items: JSON.parse(JSON.stringify(current.items))
        };
        schedules.push(duplicate);
        currentScheduleIndex = schedules.length - 1;
        saveSchedules();
        renderCurrentSchedule();
    });

    document.getElementById('rename-btn').addEventListener('click', function() {
        const current = schedules[currentScheduleIndex];
        const newName = prompt('Rename schedule to:', current.name);
        if (newName) {
            schedules[currentScheduleIndex].name = newName;
            saveSchedules();
            renderCurrentSchedule();
        }
    });

    document.getElementById('delete-btn').addEventListener('click', function() {
        if (schedules.length === 1) {
            alert('Cannot delete the only schedule!');
            return;
        }
        if (!confirm('Delete this schedule?')) return;
        
        schedules.splice(currentScheduleIndex, 1);
        if (currentScheduleIndex >= schedules.length) {
            currentScheduleIndex = schedules.length - 1;
        }
        saveSchedules();
        renderCurrentSchedule();
    });

    document.getElementById('view-full-btn').addEventListener('click', function() {
        updateSelectedSchedule();
        window.location.href = 'landing.html';
    });

    // Save schedules to localStorage
    function saveSchedules() {
        try {
            localStorage.setItem('userSchedules', JSON.stringify({
                schedules: schedules,
                selectedId: schedules[currentScheduleIndex].id
            }));
        } catch (e) {
            console.error('Failed to save schedules', e);
        }
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        if (e.key === 'ArrowLeft' && currentScheduleIndex > 0) {
            document.getElementById('prev-schedule').click();
        } else if (e.key === 'ArrowRight' && currentScheduleIndex < schedules.length - 1) {
            document.getElementById('next-schedule').click();
        }
    });

    // Initialize
    loadSchedules();
});