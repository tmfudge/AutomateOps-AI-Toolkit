from flask import Flask, render_template, request, jsonify
from urllib.parse import urlparse, urlencode
import re
from datetime import datetime

app = Flask(__name__)

# Configuration for dropdown options
MEDIUM_OPTIONS = {
    'email': ['hs-email', 'newsletter'],
    'social': ['linkedin', 'X'],
    'community': ['slack', 'chapter'],
    'events': ['accelevents', 'zoom'],
    'blog': ['blog'],
    'podcast': ['opscast'],
    'website': ['website'],
    'partner': ['custom']  # Partner will use a text input field
}

REGION_OPTIONS = ['NA', 'EU', 'APAC']

def validate_url(url):
    try:
        result = urlparse(url)
        return all([result.scheme, result.netloc])
    except:
        return False

def validate_date(date_str):
    try:
        datetime.strptime(date_str, '%Y-%m-%d')
        return True
    except ValueError:
        return False

@app.route('/')
def index():
    return render_template('index.html', 
                         medium_options=MEDIUM_OPTIONS, 
                         region_options=REGION_OPTIONS)

@app.route('/build-utm', methods=['POST'])
def build_utm():
    data = request.form
    
    # Validate inputs
    if not validate_url(data['base_url']):
        return jsonify({'error': 'Invalid URL format'}), 400
    
    if not all([data['campaign_name'], data['medium'], data['source'], data['content']]):
        return jsonify({'error': 'All fields are required'}), 400

    # Build UTM parameters
    utm_params = {
        'utm_campaign': data['campaign_name'],
        'utm_medium': data['medium'],
        'utm_source': data['source'],
        'utm_content': data['content']
    }
    
    # Construct final URL
    base_url = data['base_url'].rstrip('/')
    utm_string = urlencode(utm_params)
    final_url = f"{base_url}?{utm_string}"
    
    return jsonify({'url': final_url})

@app.route('/generate-property-name', methods=['POST'])
def generate_property_name():
    data = request.form
    
    # Validate inputs
    if not all([data['campaign_name'], data['date'], data['region']]):
        return jsonify({'error': 'All fields are required'}), 400
    
    if not validate_date(data['date']):
        return jsonify({'error': 'Invalid date format'}), 400
    
    if data['region'] not in REGION_OPTIONS:
        return jsonify({'error': 'Invalid region'}), 400
    
    # Generate property name
    property_name = f"{data['region']}-{data['campaign_name']}-{data['date'].replace('-', '')}"
    
    return jsonify({'property_name': property_name})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
