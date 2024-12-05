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

PROPERTY_TYPES = {
    'LP': 'Landing Page',
    'EM': 'Email',
    'FR': 'Form',
    'LIS': 'List',
    'NL': 'Newsletter',
    'TD': 'Tradeshow',
    'WB': 'Webinar',
    'WF': 'Workflow'
}

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
                         property_types=PROPERTY_TYPES)

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
    
    # Get the list of selected property types
    property_types = request.form.getlist('property_types[]')
    
    # Validate inputs
    if not property_types:
        return jsonify({'error': 'At least one property type must be selected'}), 400
        
    if not all([data['description']]):
        return jsonify({'error': 'Description is required'}), 400
    
    # Format the date
    today = datetime.now().strftime('%Y%m%d')
    
    # Format description (replace spaces with hyphens)
    description = '-'.join(data['description'].split())
    
    # Format partner name if provided
    partner = data.get('partner', '').strip()
    if partner:
        partner = '-'.join(partner.split())
    
    # Generate property names for each selected type
    property_names = []
    for prop_type in property_types:
        if prop_type not in PROPERTY_TYPES:
            continue
            
        # Build the parts of the name
        parts = [today, prop_type]
        if partner:
            parts.append(partner)
        parts.append(description)
        
        # Join with " | " separator
        property_names.append(' | '.join(parts))
    
    return jsonify({'property_names': property_names})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
