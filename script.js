/**
 * Fusion Family Medical Practice
 * Main JavaScript File
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initNavigation();
    initScrollEffects();
    initFormHandling();
    initFileUpload();
    initBackToTop();
    setMinDates();
    initQuickDateButtons();
});

/**
 * Navigation Functionality
 */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.getElementById('navbar');

    // Mobile menu toggle
    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
            document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
        });
    }

    // Close menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // Navbar scroll effect
    let lastScroll = 0;
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });

    // Active link highlighting
    const sections = document.querySelectorAll('section[id]');

    window.addEventListener('scroll', function() {
        const scrollY = window.pageYOffset;

        sections.forEach(section => {
            const sectionHeight = section.offsetHeight;
            const sectionTop = section.offsetTop - 150;
            const sectionId = section.getAttribute('id');
            const navLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);

            if (navLink) {
                if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
                    navLink.classList.add('active');
                } else {
                    navLink.classList.remove('active');
                }
            }
        });
    });
}

/**
 * Scroll Effects
 */
function initScrollEffects() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const headerOffset = 100;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });

    // Fade in animations on scroll
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.service-card, .review-card, .contact-item').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
        observer.observe(el);
    });
}

/**
 * Form Handling and WhatsApp Submission
 */
function initFormHandling() {
    const form = document.getElementById('appointmentForm');
    const visitReasonSelect = document.getElementById('visitReason');
    const otherReasonGroup = document.getElementById('otherReasonGroup');
    const allergiesYes = document.getElementById('allergiesYes');
    const allergiesGroup = document.getElementById('allergiesGroup');
    const medicalAidYes = document.getElementById('medicalAidYes');
    const medicalAidDetails = document.querySelectorAll('.medical-aid-details');

    // Show/hide "Other" reason field
    if (visitReasonSelect) {
        visitReasonSelect.addEventListener('change', function() {
            if (this.value === 'Other') {
                otherReasonGroup.style.display = 'block';
                document.getElementById('otherReason').required = true;
            } else {
                otherReasonGroup.style.display = 'none';
                document.getElementById('otherReason').required = false;
            }
        });
    }

    // Show/hide allergies details
    document.querySelectorAll('input[name="hasAllergies"]').forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'Yes') {
                allergiesGroup.style.display = 'block';
            } else {
                allergiesGroup.style.display = 'none';
            }
        });
    });

    // Show/hide medical aid details
    document.querySelectorAll('input[name="hasMedicalAid"]').forEach(radio => {
        radio.addEventListener('change', function() {
            medicalAidDetails.forEach(detail => {
                detail.style.display = this.value === 'Yes' ? 'block' : 'none';
            });
        });
    });

    // Form submission
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();

            if (!validateForm(form)) {
                return;
            }

            const formData = collectFormData(form);
            const whatsappMessage = formatWhatsAppMessage(formData);

            // WhatsApp clinic number
            const clinicNumber = '264814745907';
            const encodedMessage = encodeURIComponent(whatsappMessage);
            const whatsappUrl = `https://wa.me/${clinicNumber}?text=${encodedMessage}`;

            // Show confirmation
            if (confirm('Your appointment request is ready to send via WhatsApp. Click OK to open WhatsApp and send your details to Fusion Family Medical Practice.')) {
                window.open(whatsappUrl, '_blank');

                // Show success message
                showNotification('Your appointment request has been prepared. Please send the message in WhatsApp to complete your booking.', 'success');
            }
        });
    }
}

/**
 * Validate Form
 */
function validateForm(form) {
    const requiredFields = form.querySelectorAll('[required]');
    let isValid = true;
    let firstError = null;

    requiredFields.forEach(field => {
        removeError(field);

        if (!field.value.trim()) {
            showError(field, 'This field is required');
            isValid = false;
            if (!firstError) firstError = field;
        } else if (field.type === 'email' && !isValidEmail(field.value)) {
            showError(field, 'Please enter a valid email address');
            isValid = false;
            if (!firstError) firstError = field;
        } else if (field.type === 'tel' && !isValidPhone(field.value)) {
            showError(field, 'Please enter a valid phone number');
            isValid = false;
            if (!firstError) firstError = field;
        }
    });

    // Check radio buttons
    const newPatientRadios = form.querySelectorAll('input[name="newPatient"]');
    const newPatientChecked = Array.from(newPatientRadios).some(radio => radio.checked);
    if (!newPatientChecked) {
        const radioGroup = newPatientRadios[0].closest('.form-group');
        showError(radioGroup, 'Please select an option');
        isValid = false;
    }

    // Check consent checkboxes
    const consentContact = form.querySelector('input[name="consentContact"]');
    const consentInfo = form.querySelector('input[name="consentInfo"]');

    if (!consentContact.checked) {
        showError(consentContact.closest('.form-group'), 'You must consent to be contacted');
        isValid = false;
    }

    if (!consentInfo.checked) {
        showError(consentInfo.closest('.form-group'), 'You must confirm your information is correct');
        isValid = false;
    }

    if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    return isValid;
}

/**
 * Show/Remove Error Messages
 */
function showError(element, message) {
    const formGroup = element.closest('.form-group');
    if (formGroup) {
        formGroup.classList.add('has-error');
        let errorEl = formGroup.querySelector('.error-message');
        if (!errorEl) {
            errorEl = document.createElement('span');
            errorEl.className = 'error-message';
            errorEl.style.cssText = 'color: #ef4444; font-size: 12px; margin-top: 4px; display: block;';
            formGroup.appendChild(errorEl);
        }
        errorEl.textContent = message;
    }
}

function removeError(element) {
    const formGroup = element.closest('.form-group');
    if (formGroup) {
        formGroup.classList.remove('has-error');
        const errorEl = formGroup.querySelector('.error-message');
        if (errorEl) {
            errorEl.remove();
        }
    }
}

/**
 * Validation Helpers
 */
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidPhone(phone) {
    // Allow various phone formats
    return /^[\d\s\+\-\(\)]{8,}$/.test(phone.replace(/\s/g, ''));
}

/**
 * Collect Form Data
 */
function collectFormData(form) {
    const data = {};

    // Text inputs and selects
    const inputs = form.querySelectorAll('input:not([type="radio"]):not([type="checkbox"]):not([type="file"]), select, textarea');
    inputs.forEach(input => {
        if (input.value) {
            data[input.name] = input.value;
        }
    });

    // Radio buttons
    const radioGroups = ['newPatient', 'visitType', 'hasAllergies', 'hasMedicalAid'];
    radioGroups.forEach(name => {
        const checked = form.querySelector(`input[name="${name}"]:checked`);
        if (checked) {
            data[name] = checked.value;
        }
    });

    // Checkboxes (chronic conditions)
    const chronicConditions = [];
    form.querySelectorAll('input[name="chronicConditions"]:checked').forEach(cb => {
        chronicConditions.push(cb.value);
    });
    if (chronicConditions.length > 0) {
        data.chronicConditions = chronicConditions.join(', ');
    }

    return data;
}

/**
 * Format WhatsApp Message
 */
function formatWhatsAppMessage(data) {
    const lines = [];

    lines.push('========================================');
    lines.push('ONLINE PATIENT REGISTRATION');
    lines.push('APPOINTMENT REQUEST');
    lines.push('*Fusion Family Medical Practice*');
    lines.push('========================================');
    lines.push('');

    lines.push('*PATIENT DETAILS*');
    lines.push('----------------------------');
    lines.push(`Full Name: ${data.fullName || 'N/A'}`);
    lines.push(`ID/Passport: ${data.idNumber || 'N/A'}`);
    lines.push(`Date of Birth: ${formatDate(data.dob) || 'N/A'}`);
    if (data.gender) lines.push(`Gender: ${data.gender}`);
    lines.push(`Phone: ${data.phone || 'N/A'}`);
    if (data.email) lines.push(`Email: ${data.email}`);
    if (data.address) lines.push(`Address: ${data.address}`);
    lines.push('');

    lines.push(`*New Patient:* ${data.newPatient || 'N/A'}`);
    lines.push('');

    lines.push('*VISIT DETAILS*');
    lines.push('----------------------------');
    let visitReason = data.visitReason || 'N/A';
    if (visitReason === 'Other' && data.otherReason) {
        visitReason = data.otherReason;
    }
    lines.push(`Reason for Visit: ${visitReason}`);
    if (data.symptoms) {
        lines.push(`Symptoms/Notes: ${data.symptoms}`);
    }
    lines.push('');

    lines.push('*APPOINTMENT PREFERENCE*');
    lines.push('----------------------------');
    lines.push(`Preferred Date: ${formatDate(data.prefDate) || 'N/A'}`);
    lines.push(`Preferred Time: ${data.prefTime || 'N/A'}`);
    lines.push(`Visit Type: ${data.visitType || 'N/A'}`);
    if (data.prefDoctor) lines.push(`Preferred Doctor: ${data.prefDoctor}`);
    lines.push('');

    // Medical Information (if provided)
    if (data.hasAllergies === 'Yes' || data.chronicConditions || data.currentMedication) {
        lines.push('*MEDICAL INFORMATION*');
        lines.push('----------------------------');
        if (data.hasAllergies === 'Yes') {
            lines.push(`Allergies: Yes - ${data.allergiesDetails || 'Details not provided'}`);
        }
        if (data.chronicConditions) {
            lines.push(`Chronic Conditions: ${data.chronicConditions}`);
        }
        if (data.currentMedication) {
            lines.push(`Current Medication: ${data.currentMedication}`);
        }
        lines.push('');
    }

    lines.push('*MEDICAL AID*');
    lines.push('----------------------------');
    if (data.hasMedicalAid === 'Yes') {
        lines.push(`Medical Aid: ${data.medicalAidName || 'N/A'}`);
        lines.push(`Member No: ${data.memberNumber || 'N/A'}`);
    } else {
        lines.push('Payment Method: Cash');
    }
    lines.push('');

    lines.push('*CONSENT*');
    lines.push('----------------------------');
    lines.push('Patient agreed to be contacted: Yes');
    lines.push('Information confirmed correct: Yes');
    lines.push('');

    lines.push('========================================');
    lines.push('Submitted via website');
    lines.push('www.fusionfamilymedical.com');
    lines.push('========================================');

    return lines.join('\n');
}

/**
 * Format Date
 */
function formatDate(dateString) {
    if (!dateString) return null;
    const date = new Date(dateString);
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options);
}

/**
 * File Upload Handling
 */
function initFileUpload() {
    const fileInput = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');

    if (fileInput && fileList) {
        fileInput.addEventListener('change', function() {
            fileList.innerHTML = '';

            Array.from(this.files).forEach((file, index) => {
                if (file.size > 5 * 1024 * 1024) {
                    showNotification(`File "${file.name}" is too large. Maximum size is 5MB.`, 'error');
                    return;
                }

                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.innerHTML = `
                    <i class="fas fa-file"></i>
                    <span>${file.name}</span>
                    <button type="button" onclick="removeFile(${index})" aria-label="Remove file">
                        <i class="fas fa-times"></i>
                    </button>
                `;
                fileList.appendChild(fileItem);
            });
        });
    }
}

/**
 * Remove File (global function for onclick)
 */
window.removeFile = function(index) {
    const fileInput = document.getElementById('fileUpload');
    const fileList = document.getElementById('fileList');

    // Note: We can't actually remove files from FileList, but we can clear and update UI
    const dt = new DataTransfer();
    const files = fileInput.files;

    for (let i = 0; i < files.length; i++) {
        if (i !== index) {
            dt.items.add(files[i]);
        }
    }

    fileInput.files = dt.files;

    // Update display
    const items = fileList.querySelectorAll('.file-item');
    if (items[index]) {
        items[index].remove();
    }
};

/**
 * Back to Top Button
 */
function initBackToTop() {
    const backToTop = document.getElementById('backToTop');

    if (backToTop) {
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 500) {
                backToTop.classList.add('visible');
            } else {
                backToTop.classList.remove('visible');
            }
        });

        backToTop.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Set Minimum Dates
 */
function setMinDates() {
    const prefDate = document.getElementById('prefDate');
    const dob = document.getElementById('dob');

    if (prefDate) {
        // Set min date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        prefDate.min = tomorrow.toISOString().split('T')[0];
    }

    if (dob) {
        // Set max date to today for DOB
        const today = new Date();
        dob.max = today.toISOString().split('T')[0];

        // Set min date to 120 years ago
        const minDate = new Date();
        minDate.setFullYear(minDate.getFullYear() - 120);
        dob.min = minDate.toISOString().split('T')[0];
    }
}

/**
 * Quick Date Buttons
 */
function initQuickDateButtons() {
    const quickDateButtons = document.querySelectorAll('.quick-date-btn');
    const prefDateInput = document.getElementById('prefDate');
    const selectedDateDisplay = document.getElementById('selectedDateDisplay');

    if (!quickDateButtons.length || !prefDateInput) return;

    // Set minimum date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    prefDateInput.min = tomorrow.toISOString().split('T')[0];

    quickDateButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const days = this.getAttribute('data-days');

            // Remove active class from all buttons
            quickDateButtons.forEach(b => b.classList.remove('active'));

            if (days === 'custom') {
                // Show the date picker
                prefDateInput.classList.add('visible');
                prefDateInput.focus();
                this.classList.add('active');

                // Hide the display if showing
                if (selectedDateDisplay) {
                    selectedDateDisplay.classList.remove('visible');
                }
            } else {
                // Calculate the date
                const targetDate = new Date();
                targetDate.setDate(targetDate.getDate() + parseInt(days));

                // Skip Sunday (clinic closed)
                if (targetDate.getDay() === 0) {
                    targetDate.setDate(targetDate.getDate() + 1);
                }

                // Set the value
                const dateString = targetDate.toISOString().split('T')[0];
                prefDateInput.value = dateString;

                // Hide the date picker, show the display
                prefDateInput.classList.remove('visible');
                this.classList.add('active');

                // Update the display
                updateDateDisplay(targetDate, selectedDateDisplay);
            }
        });
    });

    // Listen for manual date input changes
    prefDateInput.addEventListener('change', function() {
        if (this.value) {
            const selectedDate = new Date(this.value + 'T00:00:00');

            // Check if it's Sunday
            if (selectedDate.getDay() === 0) {
                showNotification('The clinic is closed on Sundays. Please select another day.', 'error');
                this.value = '';
                return;
            }

            updateDateDisplay(selectedDate, selectedDateDisplay);

            // Update active button state
            quickDateButtons.forEach(btn => {
                if (btn.getAttribute('data-days') === 'custom') {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });
        }
    });
}

/**
 * Update Date Display
 */
function updateDateDisplay(date, displayElement) {
    if (!displayElement) return;

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const formattedDate = date.toLocaleDateString('en-GB', options);
    const dayName = date.toLocaleDateString('en-GB', { weekday: 'long' });

    // Calculate days from now
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    date.setHours(0, 0, 0, 0);
    const diffTime = date - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let relativeText = '';
    if (diffDays === 1) {
        relativeText = 'Tomorrow';
    } else if (diffDays === 0) {
        relativeText = 'Today';
    } else if (diffDays <= 7) {
        relativeText = `In ${diffDays} days`;
    } else {
        relativeText = `In ${Math.ceil(diffDays / 7)} week${diffDays > 7 ? 's' : ''}`;
    }

    displayElement.innerHTML = `
        <div class="date-label">Selected Appointment Date</div>
        <div class="date-value">${formattedDate}</div>
        <div class="date-day">${relativeText} - ${dayName}</div>
    `;
    displayElement.classList.add('visible');
}

/**
 * Show Notification
 */
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        max-width: 400px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        border-radius: 12px;
        box-shadow: 0 10px 25px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
        font-size: 14px;
        line-height: 1.5;
    `;
    notification.textContent = message;

    // Add close button
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
        position: absolute;
        top: 8px;
        right: 12px;
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        opacity: 0.8;
    `;
    closeBtn.onclick = () => notification.remove();
    notification.appendChild(closeBtn);

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animation keyframes
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .fade-in {
        opacity: 1 !important;
        transform: translateY(0) !important;
    }
    .nav-link.active {
        color: #2b4ea3;
        background: #e8f4fc;
    }
    .has-error input,
    .has-error select,
    .has-error textarea {
        border-color: #ef4444 !important;
    }
`;
document.head.appendChild(style);
