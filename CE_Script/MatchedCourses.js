import React, { useState, useEffect } from "react";

function MatchedCourses() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/api/matched-courses")
      .then(response => response.json())
      .then(data => setCourses(data))
      .catch(error => console.error("Error fetching matched courses:", error));
  }, []);

  return (
    <div>
      <h1>Matched Courses</h1>
      <ul>
        {courses.map(course => (
          <li key={course.unique}>
            {course.course_name} – Professor Rating: {course.professor_rating || "N/A"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default MatchedCourses;
