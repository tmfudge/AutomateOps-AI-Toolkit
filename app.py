from flask import Flask, render_template, request, jsonify
from urllib.parse import urlparse, urlencode, parse_qs, urlunparse
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
    'partner': ['custom']
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

@app.route('/')
def index():
    """Render the main page with both tools"""
    return render_template('index.html',
                         medium_options=MEDIUM_OPTIONS,
                         property_types=PROPERTY_TYPES)

@app.route('/build-utm', methods=['POST'])
def build_utm():
    """Generate a UTM-tagged URL"""
    data = request.form
    
    # Basic validation
    if not data.get('base_url'):
        return jsonify({'error': 'Base URL is required'}), 400
        
    if not data.get('campaign_name'):
        return jsonify({'error': 'Campaign Name is required'}), 400
        
    if not data.get('medium'):
        return jsonify({'error': 'Medium is required'}), 400
        
    if not data.get('source'):
        return jsonify({'error': 'Source is required'}), 400
    
    # Parse the base URL
    parsed_url = urlparse(data['base_url'])
    base_url = urlunparse((
        parsed_url.scheme,
        parsed_url.netloc,
        parsed_url.path,
        parsed_url.params,
        '',  # Clear existing query parameters
        ''   # Clear fragments
    ))
    
    # Build UTM parameters
    utm_params = {
        'utm_source': data.get('source_custom') if data.get('source') == 'other' else data.get('source'),
        'utm_medium': data['medium'],
        'utm_campaign': data['campaign_name'].lower().replace(' ', '-')
    }
    
    # Generate the final URL
    utm_string = urlencode(utm_params)
    final_url = f"{base_url}?{utm_string}"
    
    return jsonify({'url': final_url})

@app.route('/generate-property-name', methods=['POST'])
def generate_property_name():
    """Generate standardized property names"""
    data = request.form
    
    # Basic validation
    if not data.get('event_date'):
        return jsonify({'error': 'Event Date is required'}), 400
        
    if not data.get('description'):
        return jsonify({'error': 'Description is required'}), 400
    
    # Get selected property types
    property_types = request.form.getlist('property_types[]')
    if not property_types:
        return jsonify({'error': 'At least one Property Type must be selected'}), 400
    
    # Get and format the event date
    event_date = datetime.strptime(data['event_date'], '%Y-%m-%d').strftime('%Y%m%d')
    
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
        parts = [event_date, prop_type]
        if partner:
            parts.append(partner)
        parts.append(description)
        
        # Join with " | " separator
        property_names.append(' | '.join(parts))
    
    return jsonify({'property_names': property_names})

@app.route('/admin/embed')
def admin_embed():
    """Admin-only page for embed codes"""
    return render_template('admin/embed.html',
                         base_url=request.url_root)

@app.route('/embed-code')
def embed_code():
    """Generate a standalone HTML version of the tools"""
    # Get the CSS content
    with open('static/css/style.css', 'r') as f:
        css_content = f.read()
    
    # Get the JavaScript content
    with open('static/js/main.js', 'r') as f:
        js_content = f.read()
    
    return render_template('embed.html',
                         css_content=css_content,
                         js_content=js_content,
                         medium_options=MEDIUM_OPTIONS,
                         property_types=PROPERTY_TYPES)

@app.route('/')
def index():
    """Serve the standalone HTML"""
    return render_template('standalone.html')

if __name__ == '__main__':
    # Configure logging
    import logging
    logging.basicConfig(level=logging.INFO)
    
    # Run the application
    app.run(
        host='0.0.0.0',
        port=5000,
        debug=True  # Enable debug mode for development
    )
