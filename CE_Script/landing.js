document.addEventListener('DOMContentLoaded', function() {
    // Handle sidebar item selection and navigation
    const sidebarItems = document.querySelectorAll('.sidebar-item');

    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove selected class from all items
            sidebarItems.forEach(i => i.classList.remove('selected'));
            // Add selected class to clicked item
            this.classList.add('selected');

          
            const text = this.textContent.trim().toUpperCase();
            if (text === 'COURSES') {
                window.location.href = 'courses.html';
            }
            
            // if (text === 'SCHEDULES') {
            //     window.location.href = 'schedules.html';
            // }
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
            <div class="course-title">${title}</div>
            <div class="course-instructor">${instructor}</div>
            <div class="course-id">${id}</div>
        `;
        
        coursesGrid.appendChild(courseCard);
    }

    // adding course practice
    // addCourse(3, 2, 'NEW COURSE', 'Smith, John', '12345', 'blue');
});
