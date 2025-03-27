import json

def load_json_objects(file_path):
    with open(file_path, "r", encoding="utf-8") as file:
        raw_data = file.read()
    # Load JSON data
    return json.loads(raw_data)

# File paths
courses_path = "./Data/courses.json"
professors_path = "./Data/professors.json"

# Load and clean courses data
courses = load_json_objects(courses_path)

# Load and clean professors data
professors = load_json_objects(professors_path)

# Create a mapping of professor names to their details
professor_dict = {
    f"{prof['tFname'].strip().upper()} {prof['tLname'].strip().upper()}": f"{prof['overall_rating']}"
    for prof in professors
}

# Match courses with their professors
for course in courses:
    instructor_name = course["instructor"].strip().upper()
    
    # Split the name into parts
    name_parts = instructor_name.split(", ")
    
    if len(name_parts) == 2:
        last_name = name_parts[0]
        
        first_name = name_parts[1].split(" ")[0]
    else:
        last_name = instructor_name  # If there's no comma, assume full name is the last name
        first_name = ""
    print(f"{first_name} {last_name}")

    course["professor_rating"] = professor_dict.get(f"{first_name} {last_name}")

# Save the formatted output
output_path = "matched_courses.json"
with open(output_path, "w", encoding="utf-8") as file:
    json.dump(courses, file, indent=4)

print(f"Matched courses saved to {output_path}")