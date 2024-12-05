document.addEventListener('DOMContentLoaded', function() {
    // Dynamic source options based on medium selection
    const mediumSelect = document.getElementById('medium');
    const sourceSelect = document.getElementById('source');
    
    const sourceOptions = {
        'email': ['hs-email', 'newsletter'],
        'social': ['linkedin', 'X'],
        'community': ['slack', 'chapter'],
        'events': ['accelevents', 'zoom'],
        'blog': ['blog'],
        'podcast': ['opscast'],
        'website': ['website'],
        'partner': ['custom']
    };
    
    const sourceInputGroup = document.getElementById('source-input-group');
    const sourceCustomInput = document.getElementById('source-custom');
    
    mediumSelect.addEventListener('change', function() {
        const medium = this.value;
        sourceSelect.innerHTML = '';
        
        if (medium) {
            // Add the default options
            sourceOptions[medium].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                sourceSelect.appendChild(optionElement);
            });
            
            // Add "Other" option
            const otherOption = document.createElement('option');
            otherOption.value = 'other';
            otherOption.textContent = 'Other';
            sourceSelect.appendChild(otherOption);
            
            sourceSelect.disabled = false;
            
            // Show/hide custom input based on medium
            if (medium === 'partner') {
                sourceCustomInput.style.display = 'block';
                sourceSelect.style.display = 'none';
                sourceCustomInput.required = true;
                sourceSelect.required = false;
            } else {
                sourceCustomInput.style.display = 'none';
                sourceSelect.style.display = 'block';
                sourceCustomInput.required = false;
                sourceSelect.required = true;
            }
        } else {
            sourceSelect.disabled = true;
            sourceCustomInput.style.display = 'none';
        }
    });
    
    sourceSelect.addEventListener('change', function() {
        if (this.value === 'other') {
            sourceCustomInput.style.display = 'block';
            sourceCustomInput.required = true;
        } else {
            sourceCustomInput.style.display = 'none';
            sourceCustomInput.required = false;
        }
    });
    
    // UTM Builder Form Submission
    document.getElementById('utm-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/build-utm', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('utm-error').textContent = data.error;
                document.getElementById('utm-error').style.display = 'block';
                document.getElementById('utm-result').style.display = 'none';
            } else {
                document.getElementById('utm-url').textContent = data.url;
                document.getElementById('utm-result').style.display = 'block';
                document.getElementById('utm-error').style.display = 'none';
            }
        });
    });
    
    // Property Name Generator Form Submission
    document.getElementById('property-form').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const formData = new FormData(this);
        
        fetch('/generate-property-name', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.error) {
                document.getElementById('property-error').textContent = data.error;
                document.getElementById('property-error').style.display = 'block';
                document.getElementById('property-result').style.display = 'none';
            } else {
                document.getElementById('property-name').textContent = data.property_name;
                document.getElementById('property-result').style.display = 'block';
                document.getElementById('property-error').style.display = 'none';
            }
        });
    });
    
    // Copy to clipboard functionality
    document.querySelectorAll('.copy-btn').forEach(button => {
        button.addEventListener('click', function() {
            const textToCopy = this.previousElementSibling.textContent;
            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = this.textContent;
                this.textContent = 'Copied!';
                setTimeout(() => {
                    this.textContent = originalText;
                }, 2000);
            });
        });
    });
});
