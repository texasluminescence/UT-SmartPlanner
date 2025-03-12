from selenium import webdriver as WebDriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.support.ui import WebDriverWait
import time
import json
import re

def main():

    year = input("Input the year that the schedule begins (If registering for Spring 2025 enter '2025'): ")
    semester = input("Input the semester to search (spring, summer, or fall): ")
    assert semester in ["spring", "summer", "fall"], "Invalid semester input"
    assert 1990 < int(year) < 3000, "Invalid year input"
    
    subdirectory = year
    if semester == "spring":
        subdirectory += "2"
    elif semester == "summer":
        subdirectory += "6"
    elif semester == "fall":
        subdirectory += "9"

    driver = WebDriver.Chrome()
    driver.get(f"https://utdirect.utexas.edu/apps/registrar/course_schedule/{subdirectory}/")

    print("Please log in and authenticate with Duo Mobile")
    while "UT Austin Registrar" not in driver.title:
        time.sleep(0.1)
    
    open('courses.json', 'w').close()
    json_file = open('courses.json', 'w')
    for level in ["lower", "upper", "grad"]:
        majors = driver.find_element(By.ID, "fos_fl").find_elements(By.TAG_NAME, "option")
        count = 0
        for major in majors:
            if count == 0:
                count += 1
                continue
            major.click()
            driver.find_element(By.ID, "level." + level).click()
            driver.find_element(By.NAME, "fnlSearch").find_element(By.CLASS_NAME, "submit_button").find_element(By.TAG_NAME, "input").click()
            WebDriverWait(driver, 10, 0.01).until(EC.presence_of_element_located((By.ID, "inner_body")))
            if driver.find_elements(By.CLASS_NAME, "error"):
                driver.back()
                continue
            WebDriverWait(driver, 10, 0.01).until(EC.presence_of_element_located((By.CLASS_NAME, "rwd-table")))
            getCourseData(driver.find_element(By.CLASS_NAME, "rwd-table"), json_file, level)
            driver.back()


    time.sleep(5)
    driver.quit()

def extract_major(header_text):
    # Get the letters+spaces until the first digit
    match = re.match(r'^([A-Za-z\s]+)(?=\d)', header_text)
    if match:
        # remove any spaces so that "A I" becomes "AI"
        return match.group(1).replace(" ", "")
    else:
        #return the first word
        return header_text.split()[0]

def getCourseData(courses_table, json_file, level):
        # Initialize an empty list to hold the course details
    courses = []

    # Loop through the rows of the table (skipping headers)
    rows = courses_table.find_elements(By.TAG_NAME, "tr")
    current_course_name = None
    current_major = None  # Variable to hold the major
    for row in rows:
        course_header = row.find_elements(By.CLASS_NAME, "course_header")
        if course_header:
            # Extract course name from the header row
            current_course_name = course_header[0].text.strip()
            # Extract major from the course name (e.g., "ARC 308" => major is "ARC")
            current_major = extract_major(current_course_name)  # Assuming major is the first part (e.g., ARC)
        else:
            # Extract individual course details
            cells = row.find_elements(By.TAG_NAME, "td")
            if level != "grad" and len(cells) < 9:
                continue
            if cells:
                course_info = {
                    "unique": cells[0].text,
                    "days": cells[1].text,
                    "hour": cells[2].text,
                    "room": cells[3].text,
                    "instruction_mode": cells[4].text,
                    "instructor": cells[5].text,
                    "status": cells[6].text,
                    "flags": cells[7].text,
                    "core": "" if level == "grad" else cells[8].text,
                    "course_name": current_course_name,
                    "major": current_major,  # Include the major
                    "level": level 
                }
                courses.append(course_info)

    # Save the data to a JSON file
    json.dump(courses, json_file, indent=4)

def check_subdirectory(subdir):
    return len(subdir) >= 5

if __name__ == "__main__":
    main()