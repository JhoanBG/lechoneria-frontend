// ===== MODIFICACIÓN EN factura.js =====

// Variables globales
let orderData = null;
let invoiceData = null;

// Cargar datos al iniciar la página
document.addEventListener("DOMContentLoaded", () => {
    loadOrderData();
    generateInvoiceData();
    updateInvoiceDisplay();
});

function loadOrderData() {
    // Intentar cargar datos del localStorage
    const savedOrder = localStorage.getItem('currentOrder');
    if (savedOrder) {
        orderData = JSON.parse(savedOrder);
        console.log('✅ Datos de pedido cargados:', orderData);
    } else {
        // Datos de ejemplo si no hay pedido guardado
        console.log('⚠️ No hay datos de pedido, usando datos de ejemplo');
        orderData = {
            orderNumber: 'LDA-' + Math.floor(100000 + Math.random() * 900000),
            customerName: 'Cliente de Ejemplo',
            customerPhone: '300-123-4567',
            customerAddress: 'Dirección no especificada',
            customerEmail: 'cliente@ejemplo.com',
            items: [
                { name: 'LECHONA', option: 'Porción Personal (250g)', quantity: 1, price: 12000 }
            ],
            total: 12000,
            subtotal: 12000,
            deliveryFee: 0,
            orderTime: new Date().toISOString(),
            status: 'confirmado',
            deliveryType: 'pickup'
        };
    }
}

function generateInvoiceData() {
    const now = new Date();
    const orderTime = orderData.orderTime ? new Date(orderData.orderTime) : now;
    
    invoiceData = {
        invoiceNumber: 'FAC-' + Date.now(),
        invoiceDate: now.toLocaleDateString('es-CO'),
        orderTime: orderTime.toLocaleTimeString('es-CO'),
        subtotal: orderData.subtotal || 0,
        deliveryFee: orderData.deliveryFee || 0,
        total: orderData.total || (orderData.subtotal + orderData.deliveryFee)
    };
}

function updateInvoiceDisplay() {
    // Actualizar información del cliente
    document.getElementById('customer-name').textContent = orderData.customerName || 'No especificado';
    document.getElementById('customer-address').textContent = orderData.customerAddress || 'No especificada';
    document.getElementById('customer-phone').textContent = orderData.customerPhone || 'No especificado';
    document.getElementById('customer-email').textContent = orderData.customerEmail || 'No proporcionado';

    // Actualizar detalles de la factura
    document.getElementById('invoice-number').textContent = invoiceData.invoiceNumber;
    document.getElementById('invoice-date').textContent = invoiceData.invoiceDate;
    document.getElementById('order-time').textContent = invoiceData.orderTime;

    // **Mostrar número de pedido original**
    const orderNumberElement = document.getElementById('order-number');
    if (orderNumberElement) {
        orderNumberElement.textContent = orderData.orderNumber || 'No disponible';
    }

    // Actualizar tabla de items
    const tbody = document.getElementById('items-tbody');
    tbody.innerHTML = '';
    
    if (orderData.items && orderData.items.length > 0) {
        orderData.items.forEach(item => {
            const row = document.createElement('tr');
            const itemTotal = item.price * (item.quantity || 1);
            row.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>${item.option || 'Estándar'}</td>
                <td>${item.quantity || 1}</td>
                <td>$${item.price.toLocaleString('es-CO')}</td>
                <td>$${itemTotal.toLocaleString('es-CO')}</td>
            `;
            tbody.appendChild(row);
        });
    } else {
        // Mostrar fila vacía si no hay items
        const row = document.createElement('tr');
        row.innerHTML = `
            <td colspan="5" style="text-align: center; color: #666;">
                No hay productos en este pedido
            </td>
        `;
        tbody.appendChild(row);
    }

    // Actualizar totales
    document.getElementById('subtotal').textContent = '$' + invoiceData.subtotal.toLocaleString('es-CO');
    document.getElementById('delivery-fee').textContent = '$' + invoiceData.deliveryFee.toLocaleString('es-CO');
    document.getElementById('total-amount').textContent = '$' + invoiceData.total.toLocaleString('es-CO');
    
    // Actualizar información de Nequi
    const nequiAmountElement = document.getElementById('nequi-amount');
    const nequiOrderElement = document.getElementById('nequi-order');
    
    if (nequiAmountElement) {
        nequiAmountElement.textContent = '$' + invoiceData.total.toLocaleString('es-CO');
    }
    if (nequiOrderElement) {
        nequiOrderElement.textContent = '#' + (orderData.orderNumber || 'N/A');
    }

    console.log('✅ Factura actualizada con datos del pedido');
}

async function saveInvoiceToDatabase() {
    if (!orderData || !invoiceData) return;

    const payload = {
        invoice_number: invoiceData.invoiceNumber,
        order_number: orderData.orderNumber,
        customer_name: orderData.customerName,
        customer_phone: orderData.customerPhone,
        customer_address: orderData.customerAddress,
        customer_email: orderData.customerEmail,
        subtotal: invoiceData.subtotal,
        delivery_fee: invoiceData.deliveryFee,
        total: invoiceData.total,
        order_time: new Date(orderData.orderTime),
        invoice_date: new Date().toISOString().split('T')[0]
    };

    try {
        const res = await fetch('http://localhost:3005/facturas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const result = await res.json();
        if (result.success) {
            console.log('✅ Factura guardada en la base de datos:', result);
        } else {
            console.warn('⚠️ No se pudo guardar la factura:', result.error);
        }
    } catch (err) {
        console.error('❌ Error al guardar factura:', err);
    }
}

// Llamar esta función justo después de updateInvoiceDisplay()
updateInvoiceDisplay();
saveInvoiceToDatabase();


// **NUEVA FUNCIÓN: Botón para volver al menú**
function goBackToMenu() {
    if (confirm('¿Deseas volver al menú? Se perderán los datos de la factura actual.')) {
        localStorage.removeItem('currentOrder');
        window.location.href = 'quintomenu.html'; // Ajusta la ruta según tu estructura
    }
}

// **FUNCIÓN MEJORADA: Ir al seguimiento**
function goToTracking() {
    // Guardar datos actualizados antes de ir al seguimiento
    if (orderData) {
        orderData.paymentStatus = 'paid';
        orderData.paymentMethod = 'nequi';
        orderData.paymentTime = new Date().toISOString();
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
    }
    
    showNotification('🏍️ Redirigiendo al seguimiento del pedido...');
    
    setTimeout(() => {
        window.location.href = 'gestion.html'; // Ajusta la ruta según tu estructura
    }, 1500);
}

// Resto de funciones permanecen igual...
function printInvoice() {
    showNotification('🖨️ Preparando impresión...');
    setTimeout(() => {
        window.print();
    }, 500);
}

function showEmailModal() {
    document.getElementById('emailModal').style.display = 'block';
    document.getElementById('email-address').value = orderData.customerEmail || '';
}

function closeEmailModal() {
    document.getElementById('emailModal').style.display = 'none';
}

function showNequiPayment() {
    document.getElementById('qr-section').style.display = 'block';
    document.getElementById('nequi-info').style.display = 'block';
    showNotification('💳 Información de pago Nequí mostrada');
    
    // Scroll suave hacia la sección de pago
    document.getElementById('qr-section').scrollIntoView({ 
        behavior: 'smooth' 
    });
}

function confirmNequiPayment() {
    if (confirm('¿Confirmas que has realizado el pago por Nequí?')) {
        goToTracking();
    }
}

// Manejo del formulario de email
document.getElementById('emailForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email-address').value;
    const message = document.getElementById('email-message').value;
    
    if (email) {
        showNotification('📧 Enviando factura a ' + email + '...');
        
        setTimeout(() => {
            showNotification('✅ Factura enviada exitosamente');
            closeEmailModal();
        }, 2000);
    }
});

// Cerrar modal al hacer clic fuera de él
window.onclick = function(event) {
    const modal = document.getElementById('emailModal');
    if (event.target === modal) {
        closeEmailModal();
    }
}

function showNotification(message) {
    // Remover notificación existente si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #4CAF50, #45a049);
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 10000;
        font-weight: 500;
        animation: slideIn 0.3s ease-out;
    `;
    
    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 4000);
}

// Función para ser llamada desde menu.js (mantener compatibilidad)
window.initializeInvoice = function(orderDataFromMenu) {
    if (orderDataFromMenu) {
        orderData = orderDataFromMenu;
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
        generateInvoiceData();
        updateInvoiceDisplay();
    }
};


