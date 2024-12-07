from flask import Flask, render_template, request, jsonify, redirect
from flask_sqlalchemy import SQLAlchemy
from urllib.parse import urlparse, urlencode
import re
import os
import string
import random
from datetime import datetime

app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

class ShortenedURL(db.Model):
    __tablename__ = 'shortened_urls'
    id = db.Column(db.Integer, primary_key=True)
    original_url = db.Column(db.Text, nullable=False)
    short_code = db.Column(db.String(10), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now())
    clicks = db.Column(db.Integer, default=0)

    def __repr__(self):
        return f'<ShortenedURL {self.short_code}>'

def generate_short_code(length=6):
    """Generate a random short code for URLs"""
    characters = string.ascii_letters + string.digits
    while True:
        code = ''.join(random.choice(characters) for _ in range(length))
        if not ShortenedURL.query.filter_by(short_code=code).first():
            return code

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
    
    if not all([data['campaign_name'], data['medium'], data['source']]):
        return jsonify({'error': 'All fields are required'}), 400

    # Build UTM parameters
    utm_params = {
        'utm_campaign': data['campaign_name'],
        'utm_medium': data['medium'],
        'utm_source': data['source']
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

@app.route('/shorten', methods=['POST'])
def shorten_url():
    url = request.form.get('url')
    if not url:
        return jsonify({'error': 'URL is required'}), 400
    
    if not validate_url(url):
        return jsonify({'error': 'Invalid URL format'}), 400

    existing = ShortenedURL.query.filter_by(original_url=url).first()
    if existing:
        return jsonify({
            'short_url': request.host_url + existing.short_code,
            'short_code': existing.short_code
        })

    short_code = generate_short_code()
    new_url = ShortenedURL(
        original_url=url,
        short_code=short_code
    )
    
    db.session.add(new_url)
    db.session.commit()
    
    return jsonify({
        'short_url': request.host_url + short_code,
        'short_code': short_code
    })

@app.route('/<short_code>')
def redirect_to_url(short_code):
    url_mapping = ShortenedURL.query.filter_by(short_code=short_code).first_or_404()
    url_mapping.clicks += 1
    db.session.commit()
    return redirect(url_mapping.original_url)

with app.app_context():
    db.create_all()

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
