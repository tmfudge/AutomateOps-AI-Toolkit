document.addEventListener('DOMContentLoaded', function() {
    // Dynamic source options based on medium selection
    const mediumSelect = document.getElementById('medium');
    const sourceSelect = document.getElementById('source');
    
    const sourceOptions = {
        'email': ['newsletter', 'promo_email'],
        'social': ['Facebook', 'Instagram', 'LinkedIn'],
        'paid_search': ['GoogleAds', 'BingAds']
    };
    
    mediumSelect.addEventListener('change', function() {
        const medium = this.value;
        sourceSelect.innerHTML = '';
        
        if (medium) {
            sourceOptions[medium].forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                sourceSelect.appendChild(optionElement);
            });
            sourceSelect.disabled = false;
        } else {
            sourceSelect.disabled = true;
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
