const courseTableBody = document.querySelector('.courseTable tbody');
const prevButton = document.querySelector('.navigation button:first-child');
const nextButton = document.querySelector('.navigation button:last-child');


let currentPage = 0;
const coursesPerPage = 5; 
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
        <tr class="${rowClass}" data-id="${course.id}">
            <td>${course.unique}</td>
            <td>${course.course_name}</td>
            <td>${course.instructor}</td>
            <td>
                ${renderFlags(course.flags)}
            </td>
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
    fetch('courses.json')
    .then(response => response.json())
    .then(data => {
        courseData = data;
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
});