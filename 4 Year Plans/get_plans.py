from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys

import time
import json

def get_plan(driver):
    """Extracts and correctly formats the four-year plan from the current page."""
    try:
        # Locate the table containing the four-year plan
        table = driver.find_element(By.TAG_NAME, "table")
        rows = table.find_elements(By.TAG_NAME, "tr")

        structured_plan = {}
        total_credit_hours = None
        current_year = None

        for row in rows:
            cells = row.find_elements(By.TAG_NAME, "td")
            class_name = row.get_attribute("class")
            # Detect "Total Credit Hours" and store separately
            if "plangridyear" in class_name:
                cells = row.find_elements(By.TAG_NAME, "th")
                text = cells[0].text.strip()
                current_year = text
                structured_plan[current_year] = {"First Term": [], "Second Term": [], "Summer Term": []}
            elif class_name == "plangridsum" or class_name == "plangridterm":
                continue
            elif "plangridtotal" in class_name:
                text = cells[0].text.strip()
                if text.lower().startswith("total credit hours"):
                    total_credit_hours = text
            else:
                first_term_course = cells[0].text.strip()
                first_term_hours = cells[1].text.strip()
                second_term_course = cells[2].text.strip()
                second_term_hours = cells[3].text.strip()
                summer_term_course = cells[4].text.strip() if len(cells) > 4 else ""
                summer_term_hours = cells[5].text.strip() if len(cells) > 5 else ""

                if first_term_course:
                    structured_plan[current_year]["First Term"].append({"Course": first_term_course, "Hours": first_term_hours})
                if second_term_course:
                    structured_plan[current_year]["Second Term"].append({"Course": second_term_course, "Hours": second_term_hours})
                if summer_term_course:
                    structured_plan[current_year]["Summer Term"].append({"Course": summer_term_course, "Hours": summer_term_hours})

        # Include total credit hours if found
        if total_credit_hours:
            structured_plan["Total Credit Hours"] = total_credit_hours

        return structured_plan

    except Exception as e:
        print(f"Error extracting plan: {e}")
        return {}

# Initialize WebDriver
driver = webdriver.Chrome()

# Load the main page
driver.get("https://registrar.utexas.edu/catalogs/degree-plans")

# Find all major links
major_links = driver.find_element(By.CLASS_NAME, "node__content").find_element(By.TAG_NAME, "ul").find_elements(By.TAG_NAME, "a")

degree_plans = {}

for i in range(len(major_links)):
    try:
        # Refresh list of links (DOM may change after navigation)
        major_links = driver.find_element(By.CLASS_NAME, "node__content").find_element(By.TAG_NAME, "ul").find_elements(By.TAG_NAME, "a")
        major = major_links[i]
        
        # Get major name
        major_name = major.text
        if not major_name:
            continue
        
        print(f"Processing {major_name}...")

        # Open the link in a new tab to avoid losing the original page
        major.send_keys(Keys.CONTROL + Keys.RETURN)
        # Extract four-year plan
        plan_data = get_plan(driver)
        degree_plans[major_name] = plan_data
        # Close the tab and return to the main page
        driver.back()

    except Exception as e:
        print(f"Error processing {major_name}: {e}")

# Save the extracted data to a JSON file
with open("./degree_plans.json", "w", encoding="utf-8") as f:
    json.dump(degree_plans, f, indent=4)

# Close the WebDriver
driver.quit()

print("Four-year plans have been saved to 'degree_plans.json'.")