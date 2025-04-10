from flask import Flask, jsonify
from flask_cors import CORS
import json
import os
import subprocess

app = Flask(__name__)
CORS(app)  # Allow cross-origin requests

# Endpoint to serve course data
@app.route('/api/courses', methods=['GET'])
def get_courses():
    # Absolute path to the directory containing server.py
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Then go up one folder and into Professor ratings
    data_file = os.path.join(script_dir, '..', 'Professor ratings', 'matched_courses.json')
    with open(data_file, 'r', encoding='utf-8') as f:
        courses_data = json.load(f)
    return jsonify(courses_data)

if __name__ == '__main__':
    app.run(debug=True)
