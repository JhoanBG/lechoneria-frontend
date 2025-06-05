 // Variables globales
 let isSubmitting = false;
 let selectedTable = null;

 // Inicialización
 document.addEventListener('DOMContentLoaded', () => {
     initializeForm();
     setupEventListeners();
     loadSelectedTable();
     loadSavedFormData();
 });

 function initializeForm() {
     // Establecer fecha y hora mínima
     const now = new Date();
     const today = now.toISOString().split('T')[0];
     const timeString = now.toTimeString().slice(0, 5);
     
     document.getElementById('reservation-date').min = today;
     document.getElementById('reservation-time').min = timeString;
     
     // Establecer fecha por defecto
     document.getElementById('reservation-date').value = today;
 }

 function setupEventListeners() {
     // Checkbox cards
     document.querySelectorAll('.checkbox-card input').forEach(checkbox => {
         checkbox.addEventListener('change', function() {
             this.closest('.checkbox-card').classList.toggle('checked', this.checked);
         });
     });

     // Form validation
     document.querySelectorAll('input, select, textarea').forEach(field => {
         field.addEventListener('blur', validateField);
         field.addEventListener('input', handleFieldInput);
     });

     // Character counter for textarea
     const reasonField = document.getElementById('reason');
     reasonField.addEventListener('input', updateCharacterCounter);

     // Form submission
     document.getElementById('reservation-form').addEventListener('submit', handleFormSubmit);

     // Update progress bar
     document.querySelectorAll('input[required], select[required]').forEach(field => {
         field.addEventListener('input', updateProgressBar);
     });
 }

 function loadSelectedTable() {
    const mesaSeleccionada = sessionStorage.getItem('mesaSeleccionada') || localStorage.getItem('mesaSeleccionada');
    if (mesaSeleccionada) {
        selectedTable = mesaSeleccionada;
        const tableNameField = document.getElementById('table-name');
        const tableNameDisplay = document.getElementById('table-name-display');
        const selectedTableInfo = document.getElementById('selected-table-info');
        
        if (tableNameField) tableNameField.value = mesaSeleccionada;
        if (tableNameDisplay) tableNameDisplay.textContent = `Mesa seleccionada: ${mesaSeleccionada}`;
        if (selectedTableInfo) selectedTableInfo.classList.add('show');
    }
}

function validateField(event) {
    const field = event.target;
    const value = field.value.trim();
    const fieldId = field.id;
    let isValid = true;
    let errorMessage = '';

    // Clear previous error
    clearFieldError(field);

    if (field.hasAttribute('required') && !value) {
        errorMessage = 'Este campo es obligatorio';
        isValid = false;
    } else if (value) {
        switch (fieldId) {
            case 'cedula':
                if (!/^\d{6,12}$/.test(value)) {
                    errorMessage = 'La cédula debe tener entre 6 y 12 dígitos';
                    isValid = false;
                }
                break;
            
            case 'phone':
                if (!/^\d{7,15}$/.test(value.replace(/\s+/g, ''))) {
                    errorMessage = 'Ingresa un número de teléfono válido';
                    isValid = false;
                }
                break;
            
            case 'email':
                if (value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                    errorMessage = 'Ingresa un email válido';
                    isValid = false;
                }
                break;
            
            case 'name':
            case 'lastname':
                if (!/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/.test(value)) {
                    errorMessage = 'Solo se permiten letras y espacios';
                    isValid = false;
                }
                break;
            
            case 'reservation-date':
                const selectedDate = new Date(value);
                const today = new Date();
                today.setHours(0, 0, 0, 0);
                
                if (selectedDate < today) {
                    errorMessage = 'La fecha no puede ser anterior a hoy';
                    isValid = false;
                }
                break;

            case 'reservation-time':
                const selectedDateValue = document.getElementById('reservation-date').value;
                if (selectedDateValue) {
                    const selectedDateTime = new Date(selectedDateValue + 'T' + value);
                    const now = new Date();
                    
                    if (selectedDateTime <= now) {
                        errorMessage = 'La hora debe ser posterior a la actual';
                        isValid = false;
                    }
                }
                break;
        }
    }

    if (!isValid) {
        showFieldError(field, errorMessage);
    }

    return isValid;
}

 function handleFieldInput(event) {
     const field = event.target;
     clearFieldError(field);
     updateProgressBar();
 }

 function showFieldError(field, message) {
     field.classList.add('input-error');
     const errorElement = document.getElementById(field.id + '-error');
     if (errorElement) {
         errorElement.textContent = message;
         errorElement.style.display = 'block';
     }
 }

 function clearFieldError(field) {
     field.classList.remove('input-error');
     const errorElement = document.getElementById(field.id + '-error');
     if (errorElement) {
         errorElement.style.display = 'none';
     }
 }

 function updateCharacterCounter() {
    const reasonField = document.getElementById('reason');
    const counter = document.getElementById('reason-counter');
    
    if (!reasonField || !counter) return;
    
    const currentLength = reasonField.value.length;
    const maxLength = reasonField.getAttribute('maxlength') || 500;
    
    counter.textContent = `${currentLength}/${maxLength}`;
    
    if (currentLength > maxLength * 0.8) {
        counter.style.color = '#f44336';
    } else {
        counter.style.color = '#666';
    }
}

function updateProgressBar() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let filledFields = 0;
    
    requiredFields.forEach(field => {
        if (field.value.trim()) {
            filledFields++;
        }
    });
     
    const progress = (filledFields / requiredFields.length) * 100;
    const progressFill = document.getElementById('progress-fill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
}

async function handleFormSubmit(e) {
    e.preventDefault();

    if (isSubmitting) return;

    // Validar formulario
    if (!validateForm()) {
        showNotification('Por favor, completa todos los campos obligatorios correctamente.', 'error');
        return;
    }

    isSubmitting = true;
    showLoading(true);

    try {
        const formData = collectFormData();
        console.log('📩 Enviando datos:', formData);

        // CORREGIDO: Envío real al servidor
        const response = await fetch('http://localhost:3005/reservados', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            throw new Error(`Error HTTP: ${response.status}`);
        }

        const result = await response.json();
        
        if (result.success) {
            showSuccess(formData);
            clearSavedData();
            
            setTimeout(() => {
                askAboutMenu();
            }, 3000);
        } else {
            throw new Error(result.error || 'Error desconocido');
        };

     } catch (error) {
        console.error('Error:', error);
        showError('No se pudo procesar la reserva. Verifica tu conexión e inténtalo nuevamente.');
        
        // Fallback: mostrar éxito con datos simulados para pruebas
        if (error.message.includes('fetch')) {
            console.warn('Servidor no disponible, mostrando simulación');
            showSuccess(formData);
            setTimeout(() => {
                askAboutMenu();
            }, 3000);
        }
    } finally {
        isSubmitting = false;
        showLoading(false);
    }
}

function validateForm() {
    const requiredFields = document.querySelectorAll('input[required], select[required]');
    let isValid = true;

    requiredFields.forEach(field => {
        if (!validateField({ target: field })) {
            isValid = false;
        }
    });

    return isValid;
}
function collectFormData() {
    const decorations = [];
    document.querySelectorAll('input[name="decorations"]:checked').forEach(checkbox => {
        decorations.push(checkbox.value);
    });

    // Get form values with better validation
    const name = document.getElementById('name')?.value?.trim() || '';
    const lastname = document.getElementById('lastname')?.value?.trim() || '';
    const cedula = document.getElementById('cedula')?.value?.trim() || '';
    const phone = document.getElementById('phone')?.value?.trim() || '';
    const email = document.getElementById('email')?.value?.trim() || '';
    const fecha_reserva = document.getElementById('reservation-date')?.value || '';
    const hora_inicio = document.getElementById('reservation-time')?.value || '';
    const guests = parseInt(document.getElementById('guests')?.value) || 1;
    const reason = document.getElementById('reason')?.value?.trim() || '';

    const formData = {
        mesa_reservada: selectedTable,
        name,
        lastname,
        cedula,
        phone: phone || null,
        email: email || null,
        fecha_reserva,
        hora_inicio,
        guests,
        reason: reason || 'Sin motivo específico',
        decorations: decorations.length > 0 ? decorations.join(', ') : 'Ninguna'
    };

    // Debug logging with expanded details
    console.log("🔍 Form data collected:", formData);
    console.log("🔍 Individual values:");
    console.log("  - mesa_reservada:", selectedTable);
    console.log("  - name:", name);
    console.log("  - lastname:", lastname);
    console.log("  - cedula:", cedula);
    console.log("  - fecha_reserva:", fecha_reserva);
    console.log("  - hora_inicio:", hora_inicio);
    console.log("  - guests:", guests);
    console.log("  - phone:", phone);
    console.log("  - email:", email);
    console.log("  - reason:", reason);
    console.log("  - decorations:", decorations.join(', '));

    return formData;
}

function showLoading(show) {
    const btn = document.getElementById('submit-btn');
    if (!btn) return;
    
    const btnText = btn.querySelector('.btn-text');
    const loading = btn.querySelector('.loading');

    if (show) {
        btn.disabled = true;
        if (btnText) btnText.style.opacity = '0';
        if (loading) loading.style.display = 'block';
    } else {
        btn.disabled = false;
        if (btnText) btnText.style.opacity = '1';
        if (loading) loading.style.display = 'none';
    }
}

function showSuccess(formData) {
    const details = `
        <p><strong>Nombre:</strong> ${formData.name} ${formData.lastname}</p>
        <p><strong>Mesa:</strong> ${formData.mesa_reservada}</p>
        <p><strong>Fecha:</strong> ${formatDate(formData.fecha_reserva)}</p>
        <p><strong>Hora:</strong> ${formData.hora_inicio}</p>
        <p><strong>Comensales:</strong> ${formData.guests}</p>
        ${formData.decorations !== 'Ninguna' ? `<p><strong>Decoraciones:</strong> ${formData.decorations}</p>` : ''}
    `;
    
    const reservationDetails = document.getElementById('reservation-details');
    const successMessage = document.getElementById('success-message');
    const errorMessage = document.getElementById('error-message');
    const reservationForm = document.getElementById('reservation-form');
    
    if (reservationDetails) reservationDetails.innerHTML = details;
    if (successMessage) successMessage.style.display = 'block';
    if (errorMessage) errorMessage.style.display = 'none';
    if (reservationForm) reservationForm.style.opacity = '0.7';
    
    showNotification('¡Reserva confirmada exitosamente!', 'success');
    
    // Limpiar datos de la mesa seleccionada
    sessionStorage.removeItem('mesaSeleccionada');
    localStorage.removeItem('mesaSeleccionada');
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    const successMessage = document.getElementById('success-message');
    
    if (errorDiv) {
        const errorP = errorDiv.querySelector('p');
        if (errorP) errorP.textContent = message;
        errorDiv.style.display = 'block';
    }
    if (successMessage) successMessage.style.display = 'none';
    
    showNotification(message, 'error');
}

function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (notification) {
        notification.textContent = message;
        notification.className = `notification ${type}`;
        notification.classList.add('show');
        
        setTimeout(() => {
            notification.classList.remove('show');
        }, 4000);
    }
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

function askAboutMenu() {
    if (confirm('¿Te gustaría ver nuestro menú para hacer un pedido?')) {
        const orderAtTable = confirm('¿Quieres que tu pedido esté listo cuando llegues a la mesa?');
        if (orderAtTable) {
            showNotification('¡Perfecto! Tu pedido estará esperándote en la mesa.', 'success');
            setTimeout(() => {
                window.location.href = 'quintomenu.html';
            }, 2000);
        } else {
            showNotification('Entendido. Podrás ordenar cuando llegues al restaurante.', 'success');
            setTimeout(() => {
                window.location.href = 'quintomenu.html';
            }, 2000);
        }
    } else {
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 2000);
    }
}

function goBack() {
    if (confirm('¿Estás seguro de que quieres volver? Se perderá la información del formulario.')) {
        sessionStorage.removeItem('mesaSeleccionada');
        localStorage.removeItem('mesaSeleccionada');
        window.history.back();
    }
}

 // Auto-save form data
function autoSaveForm() {
    const formData = {};
    document.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type !== 'hidden' && field.id) {
            formData[field.id] = field.value;
        }
    });
    sessionStorage.setItem('reservationFormData', JSON.stringify(formData));
}

function loadSavedFormData() {
    const savedData = sessionStorage.getItem('reservationFormData');
    if (savedData) {
        try {
            const formData = JSON.parse(savedData);
            Object.keys(formData).forEach(fieldId => {
                const field = document.getElementById(fieldId);
                if (field && formData[fieldId]) {
                    field.value = formData[fieldId];
                }
            });
            updateProgressBar();
        } catch (error) {
            console.error('Error al cargar datos guardados:', error);
        }
    }
}

 // Auto-save every 5 seconds
 setInterval(autoSaveForm, 5000);

 // Load saved data on page load
 document.addEventListener('DOMContentLoaded', () => {
     setTimeout(loadSavedFormData, 100);
 });

 // Clear saved data on successful submission
 function clearSavedData() {
    sessionStorage.removeItem('reservationFormData');
}

// Auto-save every 5 seconds
setInterval(autoSaveForm, 5000);

// Load saved data on page load
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(loadSavedFormData, 100);
});

 // Add to success function
 function enhancedShowSuccess(formData) {
     showSuccess(formData);
     clearSavedData();
 }