document.addEventListener('DOMContentLoaded', function() {
    // UTM Builder Form Handler
    const utmForm = document.getElementById('utm-form');
    if (utmForm) {
        const mediumSelect = document.getElementById('medium');
        const sourceSelect = document.getElementById('source');
        const sourceCustom = document.getElementById('source-custom');
        
        // Medium to Source mapping
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

        // Update source options when medium changes
        mediumSelect.addEventListener('change', function() {
            const medium = this.value;
            sourceSelect.innerHTML = '<option value="">Select Source</option>';
            sourceSelect.disabled = !medium;
            
            if (medium) {
                const sources = sourceOptions[medium] || [];
                sources.forEach(source => {
                    const option = document.createElement('option');
                    option.value = source;
                    option.textContent = source;
                    sourceSelect.appendChild(option);
                });
                
                // Add "Other" option
                const otherOption = document.createElement('option');
                otherOption.value = 'other';
                otherOption.textContent = 'Other';
                sourceSelect.appendChild(otherOption);
            }
            
            // Hide custom source input
            sourceCustom.style.display = 'none';
            sourceCustom.value = '';
        });

        // Show/hide custom source input
        sourceSelect.addEventListener('change', function() {
            sourceCustom.style.display = this.value === 'other' ? 'block' : 'none';
            if (this.value !== 'other') {
                sourceCustom.value = '';
            }
        });

        // Handle form submission
        utmForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            fetch('/build-utm', {
                method: 'POST',
                body: new FormData(this)
            })
            .then(response => response.json())
            .then(data => {
                const utmError = document.getElementById('utm-error');
                if (data.error) {
                    utmError.textContent = data.error;
                    utmError.style.display = 'block';
                    document.getElementById('utm-result').style.display = 'none';
                } else {
                    utmError.style.display = 'none';
                    const utmUrlInput = document.getElementById('utm-url-input');
                    utmUrlInput.value = data.url;
                    document.getElementById('utm-result').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('utm-error').textContent = 'An error occurred while generating the URL.';
                document.getElementById('utm-error').style.display = 'block';
            });
        });
    }

    // Property Name Generator Form Handler
    const propertyForm = document.getElementById('property-form');
    if (propertyForm) {
        propertyForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            fetch('/generate-property-name', {
                method: 'POST',
                body: new FormData(this)
            })
            .then(response => response.json())
            .then(data => {
                const propertyError = document.getElementById('property-error');
                if (data.error) {
                    propertyError.textContent = data.error;
                    propertyError.style.display = 'block';
                    document.getElementById('property-result').style.display = 'none';
                } else {
                    propertyError.style.display = 'none';
                    const namesList = document.getElementById('property-names-list');
                    namesList.innerHTML = data.property_names.map(name => 
                        `<div class="d-flex align-items-center mb-2">
                            <input type="text" class="form-control me-2" value="${name}" readonly>
                            <button class="btn btn-outline-primary" onclick="copyText(this)">Copy</button>
                         </div>`
                    ).join('');
                    document.getElementById('property-result').style.display = 'block';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('property-error').textContent = 'An error occurred while generating the property name.';
                document.getElementById('property-error').style.display = 'block';
            });
        });
    }
});

// Copy functions
function copyUrl() {
    const urlInput = document.getElementById('utm-url-input');
    navigator.clipboard.writeText(urlInput.value).then(() => {
        const button = urlInput.nextElementSibling;
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}

function copyText(button) {
    const input = button.previousElementSibling;
    input.select();
    navigator.clipboard.writeText(input.value).then(() => {
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        setTimeout(() => {
            button.textContent = originalText;
        }, 2000);
    });
}