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
    closeButton.addEventListener('click', function() {
        console.log('Close button clicked');
        // window.close(); 
    });

   
    const helpButton = document.querySelector('.help-btn');
    helpButton.addEventListener('click', function() {
        console.log('Help button clicked');
        
    });

    // Function to update progress percentage
    function updateProgress(percentage) {
        const progressCircle = document.querySelector('.progress-circle');
        const progressText = document.querySelector('.progress-text');
        
        progressCircle.style.background = `conic-gradient(#6ABD68 0% ${percentage}%, #E0E0E0 ${percentage}% 100%)`;
        progressText.textContent = `${percentage}%`;
    }

    
    updateProgress(65);
    
    
    function addCourse(dayColumn, rowPosition, title, instructor, id, color) {
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
    }

    // load persisted schedule and render
    (function loadPersistedSchedule() {
        const schedule = JSON.parse(localStorage.getItem('userSchedule') || '[]');
        schedule.forEach(item => {
            addCourse(item.day, item.row, item.course_name, item.instructor, item.id, item.color || 'red');
        });

        // allow clicking the remove button on a course-card to remove all instances of that course
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
            // remove all schedule entries matching this course id
            const schedule = JSON.parse(localStorage.getItem('userSchedule') || '[]').filter(s => String(s.id) !== String(id));
            localStorage.setItem('userSchedule', JSON.stringify(schedule));
            // signal other pages that schedule was updated (helps other tabs/windows update their UI)
            try { localStorage.setItem('userScheduleUpdated', String(Date.now())); } catch (e) {}
            // remove all course cards in the grid that match this id
            const allCards = coursesGrid.querySelectorAll('.course-card');
            allCards.forEach(c => {
                const cid = c.querySelector('.course-id')?.textContent;
                if (String(cid) === String(id)) c.remove();
            });
        });
    })();

    // adding course practice
    // addCourse(3, 2, 'NEW COURSE', 'Smith, John', '12345', 'blue');
});
