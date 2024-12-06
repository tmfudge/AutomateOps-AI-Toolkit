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
        
        const shortenUrl = document.getElementById('shorten_url').checked;
        formData.append('shorten', shortenUrl);
        
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
                let resultHtml = `
                    <div class="mb-3">
                        <strong>Full URL:</strong>
                        <div class="d-flex align-items-center">
                            <span class="text-break me-2">${data.url}</span>
                            <button class="btn btn-sm btn-outline-primary copy-btn">Copy</button>
                        </div>
                    </div>`;

                if (data.shortened_url) {
                    resultHtml += `
                    <div>
                        <strong>Shortened URL:</strong>
                        <div class="d-flex align-items-center">
                            <span class="text-break me-2">${data.shortened_url}</span>
                            <button class="btn btn-sm btn-outline-primary copy-btn">Copy</button>
                        </div>
                    </div>`;
                }

                document.getElementById('utm-url').innerHTML = resultHtml;
                document.getElementById('utm-result').style.display = 'block';
                document.getElementById('utm-error').style.display = 'none';
                initializeCopyButtons();
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
                const propertyNamesList = document.getElementById('property-names-list');
                propertyNamesList.innerHTML = '';
                
                data.property_names.forEach(name => {
                    const div = document.createElement('div');
                    div.className = 'd-flex align-items-center mb-2';
                    div.innerHTML = `
                        <span class="text-break me-2">${name}</span>
                        <button class="btn btn-sm btn-outline-primary copy-btn">Copy</button>
                    `;
                    propertyNamesList.appendChild(div);
                });
                
                document.getElementById('property-result').style.display = 'block';
                document.getElementById('property-error').style.display = 'none';
                
                // Reinitialize copy buttons
                initializeCopyButtons();
            }
        });
    });
    
    // Copy to clipboard functionality
    function initializeCopyButtons() {
        document.querySelectorAll('.copy-btn').forEach(button => {
            button.addEventListener('click', async function() {
                const textToCopy = this.previousElementSibling.textContent;
                try {
                    await navigator.clipboard.writeText(textToCopy);
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                } catch (err) {
                    console.error('Failed to copy text: ', err);
                    // Fallback for older browsers
                    const textarea = document.createElement('textarea');
                    textarea.value = textToCopy;
                    document.body.appendChild(textarea);
                    textarea.select();
                    document.execCommand('copy');
                    document.body.removeChild(textarea);
                    const originalText = this.textContent;
                    this.textContent = 'Copied!';
                    setTimeout(() => {
                        this.textContent = originalText;
                    }, 2000);
                }
            });
        });
    }

    // Initialize copy buttons on page load
    initializeCopyButtons();
});
