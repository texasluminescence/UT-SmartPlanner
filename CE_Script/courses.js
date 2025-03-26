// sample data
let courseData = [
    {
        id: "52433",
        title: "INTRODUCTION TO PROGRAMMING",
        professor: "RAMSEY, CAROL",
        flags: ["CD", "WR II", "WR"],
        rmp: 3,
        status: "normal"
    },
    {
        id: "52433",
        title: "INTRODUCTION TO PROGRAMMING",
        professor: "RAMSEY, CAROL",
        flags: ["CD", "WR II", "WR"],
        rmp: 3,
        status: "conflict"
    },
    {
        id: "52433",
        title: "INTRODUCTION TO PROGRAMMING",
        professor: "RAMSEY, CAROL",
        flags: ["CD", "WR II", "WR"],
        rmp: 3,
        status: "selected"
    },
    {
        id: "52433",
        title: "INTRODUCTION TO PROGRAMMING",
        professor: "RAMSEY, CAROL",
        flags: ["CD", "WR II", "WR"],
        rmp: 3,
        status: "normal"
    },
    {
        id: "52433",
        title: "INTRODUCTION TO PROGRAMMING",
        professor: "RAMSEY, CAROL",
        flags: ["CD", "WR II", "WR"],
        rmp: 3,
        status: "potential"
    },
    // page 2 courses
    {
        id: "57801",
        title: "DATA STRUCTURES",
        professor: "ABRAHAM, JOANNE",
        flags: ["QR", "WR"],
        rmp: 4,
        status: "normal"
    },
    {
        id: "59723",
        title: "ALGORITHMS AND COMPLEXITY",
        professor: "BAKER, DAVID",
        flags: ["QR", "IL"],
        rmp: 5,
        status: "selected"
    },
    {
        id: "54219",
        title: "COMPUTER ARCHITECTURE",
        professor: "JOHNSON, MICHAEL",
        flags: ["CD", "IL"],
        rmp: 2,
        status: "conflict"
    },
    // page 3 courses
    {
        id: "51094",
        title: "OPERATING SYSTEMS",
        professor: "CHANG, SARAH",
        flags: ["QR", "WR II"],
        rmp: 4,
        status: "potential"
    },
    {
        id: "58612",
        title: "DATABASE MANAGEMENT",
        professor: "WILSON, PATRICIA",
        flags: ["CD", "IL"],
        rmp: 3,
        status: "normal"
    },
    {
        id: "53978",
        title: "COMPUTER NETWORKS",
        professor: "MARTINEZ, JAMES",
        flags: ["QR", "WR"],
        rmp: 4,
        status: "selected"
    },
    {
        id: "55321",
        title: "SOFTWARE ENGINEERING",
        professor: "THOMPSON, RICHARD",
        flags: ["IL", "WR II"],
        rmp: 5,
        status: "normal"
    }
];


const courseTableBody = document.querySelector('.courseTable tbody');
const prevButton = document.querySelector('.navigation button:first-child');
const nextButton = document.querySelector('.navigation button:last-child');


let currentPage = 0;
const coursesPerPage = 5; 

// star rating for each course
function renderStars(count) {
    return '★'.repeat(count);
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
            <td>${course.id}</td>
            <td>${course.title}</td>
            <td>${course.professor}</td>
            <td>
                ${course.flags.map(flag => `<span class="flag">${flag}</span>`).join('')}
            </td>
            <td>${renderStars(course.rmp)}</td>
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
    
    renderCoursesTable();
    
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