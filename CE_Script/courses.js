import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom";

function Courses() {
  // State to store fetched courses and current page for pagination.
  const [courses, setCourses] = useState([]);
  const [currentPage, setCurrentPage] = useState(0);
  const coursesPerPage = 5;

  // Fetch data from your backend API when component mounts.
  useEffect(() => {
    fetch("http://localhost:5000/api/matched-courses")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Network response not ok");
        }
        return response.json();
      })
      .then((data) => setCourses(data))
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  // Calculate total pages for pagination
  const totalPages = Math.ceil(courses.length / coursesPerPage);
  const startIndex = currentPage * coursesPerPage;
  const currentCourses = courses.slice(startIndex, startIndex + coursesPerPage);

  // Handlers for pagination buttons
  function handlePrev() {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }
  }

  function handleNext() {
    if (currentPage < totalPages - 1) {
      setCurrentPage(currentPage + 1);
    }
  }

  // Helper function for rendering star ratings.
  function renderStars(rating) {
    if (rating && rating > 0) {
      const stars = "★".repeat(Math.floor(rating));
      return `${rating} ${stars}`;
    }
    return "N/A";
  }

  // Dictionary to convert flag names to abbreviations.
  const flagsDict = {
    "Independent Inquiry": "II",
    "Writing": "WR",
    "Global Cultures": "GC",
    "Cultural Diversity": "CD",
    "Quantitative Reasoning": "QR",
    "Ethics": "E"
  };

  // Convert the flags string into an array of spans.
  function renderFlags(flags) {
    if (!flags) return "";
    const flagsArray = flags.split("\n").map(
      (flag) => flagsDict[flag] || flag
    );
    return flagsArray.map((flag, index) => (
      <span key={index} className="flag">
        {flag}
      </span>
    ));
  }

  return (
    <div>
      <table className="courseTable">
        <thead>
          <tr>
            <th>ID</th>
            <th>TITLE</th>
            <th>PROFESSOR</th>
            <th>FLAGS</th>
            <th>RMP</th>
          </tr>
        </thead>
        <tbody>
          {currentCourses.map((course) => (
            <tr key={course.unique} className="courseRow">
              <td>{course.unique}</td>
              <td>{course.course_name}</td>
              <td>{course.instructor}</td>
              <td>{renderFlags(course.flags)}</td>
              <td>{renderStars(course.professor_rating)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="navigation">
        <button 
          className="navArrow" 
          onClick={handlePrev} 
          disabled={currentPage === 0}
        >
          ←
        </button>
        <button 
          className="navArrow" 
          onClick={handleNext} 
          disabled={currentPage >= totalPages - 1 || totalPages === 0}
        >
          →
        </button>
      </div>
    </div>
  );
}

// Render the Courses component into the root element of courses.html.
ReactDOM.render(<Courses />, document.getElementById("root"));
