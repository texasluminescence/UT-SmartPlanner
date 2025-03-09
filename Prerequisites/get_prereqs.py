from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.common.exceptions import NoSuchElementException
import json
import re
# Change semester to scrape different semesters "spr" or "fall" or "sum"
semester = "spr 25"
driver = webdriver.Chrome()
driver.get("https://utdirect.utexas.edu/registrar/preq/list.WBX") 

# Wait for the page to load
WebDriverWait(driver, 100).until(
    EC.presence_of_element_located((By.XPATH, f"//h1[contains(text(), 'See {semester} courses')]"))
)
# Dictionary to store prerequisites
prerequisites_data = {}

def get_prerequisites():
    # Extract course name
    try: 
        course_name = driver.find_element(
            By.XPATH, "/html/body/div[4]/div[2]/div[2]/span[2]"
        ).find_element(By.CLASS_NAME, "bold").text
        if course_name.startswith("all"):
            course_name = re.sub(r"^all credit values of\s+", "", course_name)
    except:
        return {}
    prerequisites = []
    
    # Find prerequisite table
    table = driver.find_element(By.XPATH, "//table[@class='tbg' and contains(@width, '75%')]")
    rows = table.find_elements(By.TAG_NAME, "tr")[1:]  # Skip header row
    
    for row in rows:
        cols = row.find_elements(By.TAG_NAME, "td")
        if len(cols) >= 3:
            requirement = cols[0].text.strip()
            
            # Skip empty rows or non-requirement rows
            if requirement:
                prerequisites.append(requirement)
    
    return {course_name: prerequisites}

def process_current_page():
    check_links = driver.find_elements(By.XPATH, "//a[contains(text(), 'chk me')]")
    hrefs = [link.get_attribute('href') for link in check_links]

    for href in hrefs:
        driver.get(href)
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, "//h1[contains(text(), 'Check me against')]"))
        )
        # Get prerequisites and add to data
        course_data = get_prerequisites()
        prerequisites_data.update(course_data)
        
        # Save to JSON after each course
        with open('prerequisites.json', 'w') as f:
            json.dump(prerequisites_data, f, indent=2)
        
        driver.back()
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, f"//h1[contains(text(), 'See {semester} courses')]"))
        )
try:
    while True:
        process_current_page()
        # Handle pagination
        try:
            next_page = driver.find_element(By.XPATH, "//a[contains(text(), 'next page')]")
            next_page.click()
            WebDriverWait(driver, 10).until(
                EC.presence_of_element_located((By.XPATH, f"//h1[contains(text(), 'See {semester} courses')]")))
        except NoSuchElementException:
            print("Finished all pages")
            break

finally:
    driver.quit()