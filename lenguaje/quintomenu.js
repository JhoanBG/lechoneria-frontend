// Base de datos de productos
const products = {
    // Platos Principales
    'LECHONA': {
        name: 'LECHONA',
        description: 'Plato tradicional colombiano que contiene cerdo entero asado relleno de cebolla, guisantes, patatas, hierbas frescas y diversas especias acompañado de arepa y chicharrón',
        image: '../assestment/Lechona.jfif',
        options: [
            { size: 'Porción Personal (250g)', price: 12000 },
            { size: 'Porción Mediana (500g)', price: 20000 },
            { size: 'Porción Grande (750g)', price: 28000 },
            { size: 'Porción Familiar (1kg)', price: 35000 }
        ]
    },
    'CHORIZOS': {
        name: 'CHORIZOS',
        description: 'Delicioso chorizo acompañado de arepa',
        image: '../assestment/Chorizos.jfif',
        options: [
            { size: '2 Chorizos + Arepa', price: 8000 },
            { size: '4 Chorizos + 2 Arepas', price: 15000 },
            { size: '6 Chorizos + 3 Arepas', price: 22000 }
        ]
    },
    'CODITOS': {
        name: 'CODITOS',
        description: '500gr de Huesos codillos acompañado de papas saladas o criollas',
        image: '../assestment/Coditos.jfif',
        options: [
            { size: '500g + Papas Saladas', price: 18000 },
            { size: '500g + Papas Criollas', price: 20000 },
            { size: '750g + Papas Mixtas', price: 25000 }
        ]
    },
    'COSTILLAS': {
        name: 'COSTILLAS',
        description: '500gr de Costilla de Cerdo acompañada con papas saladas o criollas',
        image: '../assestment/Costilla.jfif',
        options: [
            { size: '500g + Papas Saladas', price: 22000 },
            { size: '500g + Papas Criollas', price: 24000 },
            { size: '750g + Papas Mixtas', price: 30000 }
        ]
    },
    'PANCETA': {
        name: 'PANCETA',
        description: '500gr de deliciosa panceta acompañada con papas saladas o criollas',
        image: '../assestment/Panzeta.jfif',
        options: [
            { size: '500g + Papas Saladas', price: 20000 },
            { size: '500g + Papas Criollas', price: 22000 },
            { size: '750g + Papas Mixtas', price: 28000 }
        ]
    },
    'TAMALES': {
        name: 'TAMALES',
        description: 'Deliciosos Tamales tolimenses acompañado con arepa',
        image: '../assestment/Tamales.jfif',
        options: [
            { size: '1 Tamal + Arepa', price: 6000 },
            { size: '2 Tamales + 2 Arepas', price: 11000 },
            { size: '3 Tamales + 3 Arepas', price: 16000 }
        ]
    },
    // Bebidas
    'GASEOSAS': {
        name: 'GASEOSAS',
        description: 'Variedad de gaseosas frías para acompañar tu comida',
        image: '../assestment/gaseosa.jpg',
        options: [
            { size: 'Coca Cola 350ml', price: 3000 },
            { size: 'Pepsi 350ml', price: 3000 },
            { size: 'Sprite 350ml', price: 3000 },
            { size: 'Fanta 350ml', price: 3000 },
            { size: 'Coca Cola 600ml', price: 4500 }
        ]
    },
    'JUGOS_NATURALES': {
        name: 'JUGOS NATURALES',
        description: 'Deliciosos jugos naturales de frutas frescas',
        image: '../assestment/jugo.jpg',
        options: [
            { size: 'Jugo de Naranja 500ml', price: 5000 },
            { size: 'Jugo de Mango 500ml', price: 5500 },
            { size: 'Jugo de Lulo 500ml', price: 6000 },
            { size: 'Jugo de Maracuyá 500ml', price: 6000 },
            { size: 'Jugo de Guanábana 500ml', price: 6500 }
        ]
    },
    'CERVEZAS': {
        name: 'CERVEZAS',
        description: 'Cervezas nacionales e importadas bien frías',
        image: '../assestment/cerveza.png',
        options: [
            { size: 'Aguila 330ml', price: 4000 },
            { size: 'Club Colombia 330ml', price: 4500 },
            { size: 'Poker 330ml', price: 3800 },
            { size: 'Corona 355ml', price: 6000 },
            { size: 'Heineken 330ml', price: 6500 }
        ]
    },
    'AGUA': {
        name: 'AGUA',
        description: 'Agua pura y refrescante',
        image: '../assestment/agua.jpg',
        options: [
            { size: 'Agua Cristal 500ml', price: 2000 },
            { size: 'Agua Cristal 1L', price: 3000 },
            { size: 'Agua Brisa 600ml', price: 2500 }
        ]
    }
};

// Carrito de compras
let cart = [];
let currentProduct = null;

// Configuración del servidor
const API_BASE_URL = 'http://localhost:3005'; // Ajusta según tu configuración

// Tarifas de domicilio
const deliveryFees = {
    pickup: 0,
    local: 3000,
    zone1: 5000,
    zone2: 8000,
    zone3: 12000
};

// Funciones principales
function showProductDetails(productId) {
    currentProduct = products[productId];
    if (!currentProduct) return;

    const modal = document.getElementById('product-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalDescription = document.getElementById('modal-description');
    const sizeSelect = document.getElementById('size-select');

    modalImage.src = currentProduct.image;
    modalImage.alt = currentProduct.name;
    modalTitle.textContent = currentProduct.name;
    modalDescription.textContent = currentProduct.description;

    // Llenar opciones de tamaño
    sizeSelect.innerHTML = '';
    currentProduct.options.forEach((option, index) => {
        const optionElement = document.createElement('option');
        optionElement.value = index;
        optionElement.textContent = `${option.size} - $${option.price.toLocaleString()}`;
        sizeSelect.appendChild(optionElement);
    });

    modal.style.display = 'block';
}

function closeModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentProduct = null;
}

function addToCart() {
    if (!currentProduct) return;

    const sizeSelect = document.getElementById('size-select');
    const selectedOptionIndex = parseInt(sizeSelect.value);
    const selectedOption = currentProduct.options[selectedOptionIndex];

    const cartItem = {
        id: Date.now(), // ID único basado en timestamp
        name: currentProduct.name,
        option: selectedOption.size,
        price: selectedOption.price,
        image: currentProduct.image
    };

    cart.push(cartItem);
    updateCartDisplay();
    closeModal();
    showNotification('¡Producto agregado al carrito!');
}

function removeFromCart(itemId) {
    cart = cart.filter(item => item.id !== itemId);
    updateCartDisplay();
    showNotification('Producto eliminado del carrito');
}

function updateCartDisplay() {
    const cartItems = document.getElementById('cart-items');
    const cartCount = document.getElementById('cart-count');
    const cartTotal = document.getElementById('cart-total');
    const totalAmount = document.getElementById('total-amount');

    cartCount.textContent = cart.length;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-cart">
                <div class="empty-cart-icon">🛒</div>
                <p>Tu carrito está vacío</p>
                <p>¡Agrega algunos productos deliciosos!</p>
            </div>
        `;
        cartTotal.classList.add('hidden');
    } else {
        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item fade-in">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-option">${item.option}</div>
                </div>
                <div class="cart-item-price">$${item.price.toLocaleString()}</div>
                <button class="btn-danger" onclick="removeFromCart(${item.id})">Eliminar</button>
            </div>
        `).join('');

        const total = cart.reduce((sum, item) => sum + item.price, 0);
        totalAmount.textContent = total.toLocaleString();
        cartTotal.classList.remove('hidden');
    }
}

function clearCart() {
    if (cart.length === 0) return;
    
    if (confirm('¿Estás seguro de que quieres vaciar el carrito?')) {
        cart = [];
        updateCartDisplay();
        showNotification('Carrito vaciado');
    }
}

function proceedToCheckout() {
    if (cart.length === 0) {
        showNotification('Tu carrito está vacío', 'error');
        return;
    }

    const checkoutModal = document.getElementById('checkout-modal');
    const invoiceDate = document.getElementById('invoice-date');
    const orderNumber = document.getElementById('order-number');
    const invoiceItems = document.getElementById('invoice-items');

    // Generar fecha y número de pedido
    const now = new Date();
    invoiceDate.textContent = now.toLocaleDateString('es-CO', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
    
    orderNumber.textContent = `LDA-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;

    // Mostrar items del pedido
    invoiceItems.innerHTML = cart.map(item => `
        <div class="invoice-item">
            <div>
                <strong>${item.name}</strong><br>
                <small>${item.option}</small>
            </div>
            <div>$${item.price.toLocaleString()}</div>
        </div>
    `).join('');

    updateInvoiceTotal();
    checkoutModal.style.display = 'block';
}

function closeCheckoutModal() {
    document.getElementById('checkout-modal').style.display = 'none';
}

function updateDeliveryFee() {
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    let selectedDelivery = 'pickup';
    
    deliveryRadios.forEach(radio => {
        if (radio.checked) {
            selectedDelivery = radio.value;
        }
    });

    updateInvoiceTotal();
}

function updateInvoiceTotal() {
    const subtotal = cart.reduce((sum, item) => sum + item.price, 0);
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    let selectedDelivery = 'pickup';
    
    deliveryRadios.forEach(radio => {
        if (radio.checked) {
            selectedDelivery = radio.value;
        }
    });

    const deliveryFee = deliveryFees[selectedDelivery];
    const total = subtotal + deliveryFee;

    document.getElementById('invoice-subtotal').textContent = subtotal.toLocaleString();
    document.getElementById('invoice-delivery-fee').textContent = deliveryFee.toLocaleString();
    document.getElementById('invoice-total').textContent = total.toLocaleString();
}

// Función para enviar orden a la base de datos
async function sendOrderToDatabase(orderData) {
    try {
        console.log('🚀 Enviando orden a la base de datos:', orderData);
        
        const response = await fetch(`${API_BASE_URL}/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(orderData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || 'Error al enviar la orden');
        }

        console.log('✅ Orden enviada exitosamente:', result);
        return result;
        
    } catch (error) {
        console.error('❌ Error al enviar orden:', error);
        throw error;
    }
}

// Función principal para confirmar orden (MODIFICADA)
async function confirmOrder() {
    const customerName = document.getElementById('customer-name').value.trim();
    const customerPhone = document.getElementById('customer-phone').value.trim();

    if (!customerName || !customerPhone) {
        showNotification('Por favor completa tu nombre y teléfono', 'error');
        return;
    }

    if (customerPhone.length < 10) {
        showNotification('Por favor ingresa un número de teléfono válido', 'error');
        return;
    }

    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    let selectedDelivery = 'pickup';
    let deliveryAddress = '';

    deliveryRadios.forEach(radio => {
        if (radio.checked) {
            selectedDelivery = radio.value;
        }
    });

    if (selectedDelivery !== 'pickup') {
        deliveryAddress = document.getElementById('delivery-address').value.trim();
        if (!deliveryAddress) {
            showNotification('Por favor ingresa la dirección de entrega', 'error');
            return;
        }
    }

    // Mostrar indicador de carga
    showNotification('Procesando pedido...', 'info');
     
    // Crear objeto del pedido para la base de datos
    const orderNumber = document.getElementById('order-number').textContent;
    const subtotal = Number(cart.reduce((sum, item) => sum + item.price, 0));
    const deliveryFee = deliveryFees[selectedDelivery];
    const total = Number(subtotal + deliveryFee);


    
    if (!Array.isArray(cart) || cart.length === 0) {
        showNotification('Error: No hay productos en el pedido', 'error');
        return;
    }

    if (isNaN(subtotal) || isNaN(total)) {
        console.error('❌ Subtotal o total no son válidos');
        return;
    }

    const orderData = {
        order_number: orderNumber,
        customer_name: customerName,
        customer_phone: customerPhone,
        delivery_type: selectedDelivery,
        delivery_address: deliveryAddress,
        delivery_fee: deliveryFee,
        items: cart.map(item => ({
            name: item.name,
            option: item.option,
            price: item.price,
            image: item.image,
            quantity: 1 
        })),
        subtotal: subtotal,
        total_amount: total
    };

    try {
        // Enviar orden a la base de datos
        const result = await sendOrderToDatabase(orderData);

        // **CONFIRMAR AUTOMÁTICAMENTE EL PEDIDO PARA PREPARACIÓN**
        try {
            await fetch(`${API_BASE_URL}/api/pedidos/auto-confirm`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            });
            console.log('✅ Pedido confirmado automáticamente para preparación');
        } catch (confirmError) {
            console.warn('⚠️ Error al confirmar automáticamente:', confirmError);
        }

        // **NUEVA FUNCIONALIDAD: Preparar datos para la factura**
        const invoiceData = {
            orderNumber: orderNumber,
            customerName: customerName,
            customerPhone: customerPhone,
            customerAddress: deliveryAddress || 'Recoger en local',
            customerEmail: '', // Puedes agregar un campo de email si necesitas
            items: cart.map(item => ({
                name: item.name,
                option: item.option,
                quantity: 1,
                price: item.price
            })),
            total: total,
            subtotal: subtotal,
            deliveryFee: deliveryFee,
            orderTime: new Date().toISOString(),
            status: 'confirmado',
            deliveryType: selectedDelivery
        };

         // **Guardar datos en localStorage para la factura**
         window.currentOrderData = invoiceData; // Guardar en variable global
        
         // Mostrar mensaje de éxito
         showNotification(`¡Pedido confirmado! Número: ${orderNumber}`, 'success');
                 
        // Generar factura
        generateInvoice({
            orderNumber: orderNumber,
            date: document.getElementById('invoice-date').textContent,
            customer: {
                name: customerName,
                phone: customerPhone
            },
            delivery: {
                type: selectedDelivery,
                address: deliveryAddress,
                fee: deliveryFee
            },
            items: [...cart],
            subtotal: subtotal,
            total: total
        });
        
        // Limpiar carrito y cerrar modal
        cart = [];
        updateCartDisplay();
        closeCheckoutModal();
        
        // **REDIRIGIR A LA FACTURA**
        setTimeout(() => {
            showNotification('📋 Pedido enviado al sistema de preparación', 'info');
        }, 1500);
        
        console.log('✅ Proceso de orden completado exitosamente');
        
    } catch (error) {
        console.error('❌ Error al procesar la orden:', error);
        showNotification('Error al procesar el pedido: ' + error.message, 'error');
    }
}

function generateInvoice(order) {
    // Crear una nueva ventana con la factura para imprimir
    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = `
        <!DOCTYPE html>
        <html lang="es">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Factura - ${order.orderNumber}</title>
            <link rel="stylesheet" href="../estilos/factura.css">
        </head>
        <body>
            <div class="container">
                <div class="invoice-header">
                    <h1>🍽️ Lechona de la Abuela</h1>
                    <p>Auténtica Comida Tradicional Colombiana</p>
                </div>

                <div class="invoice-content">
                    <div class="invoice-info">
                        <div class="company-info">
                            <h3>Información del Restaurante</h3>
                            <p><strong>Lechona de la Abuela</strong></p>
                            <p>Calle Principal #123</p>
                            <p>Teléfono: (601) 234-5678</p>
                            <p>Email: info@lechonaabuela.com</p>
                        </div>

                        <div class="customer-info">
                            <h3>Información del Cliente</h3>
                            <p><strong>${order.customer.name}</strong></p>
                            <p>Teléfono: ${order.customer.phone}</p>
                            ${order.delivery.address ? `<p>Dirección: ${order.delivery.address}</p>` : ''}
                        </div>
                    </div>

                    <div class="invoice-details">
                        <div class="detail-item">
                            <strong>Número de Pedido</strong>
                            <span>${order.orderNumber}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Fecha</strong>
                            <span>${order.date}</span>
                        </div>
                        <div class="detail-item">
                            <strong>Tipo de Entrega</strong>
                            <span>${getDeliveryTypeName(order.delivery.type)}</span>
                        </div>
                    </div>

                    <table class="items-table">
                        <thead>
                            <tr>
                                <th>Producto</th>
                                <th>Descripción</th>
                                <th>Precio</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${order.items.map(item => `
                                <tr>
                                    <td><strong>${item.name}</strong></td>
                                    <td>${item.option}</td>
                                    <td>$${item.price.toLocaleString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>

                    <div class="total-section">
                        <div class="total-row">
                            <span>Subtotal:</span>
                            <span>$${order.subtotal.toLocaleString()}</span>
                        </div>
                        <div class="total-row">
                            <span>Domicilio:</span>
                            <span>$${order.delivery.fee.toLocaleString()}</span>
                        </div>
                        <div class="total-row total-final">
                            <span>TOTAL A PAGAR:</span>
                            <span>$${order.total.toLocaleString()}</span>
                        </div>
                    </div>

                    <div class="actions-container">
                        <button class="action-btn print-btn" onclick="window.print()">
                            🖨️ Imprimir Factura
                        </button>
                        <button class="action-btn track-btn" onclick="window.location.href = '../html/index.html'">
                            ✅ Cerrar
                        </button>
                        <button class="action-btn track-btn" onclick="window.location.href = '../html/gestion.html'">
                            Seguimiento Domicilio
                        </button>
                    </div>

                    <div class="footer">
                        <p>¡Gracias por tu pedido! Te contactaremos pronto para confirmar la entrega.</p>
                        <p>Para cualquier consulta, comunícate con nosotros al (601) 234-5678</p>
                        <p><small>Orden guardada en el sistema - ID: ${order.orderNumber}</small></p>
                    </div>
                </div>
            </div>
        </body>
        </html>
    `;
    
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();
}

function getDeliveryTypeName(type) {
    const names = {
        pickup: '🏪 Recoger en el local',
        local: '🚴‍♂️ Domicilio Local',
        zone1: '🚗 Zona 1 - Hasta 5km',
        zone2: '🚛 Zona 2 - Hasta 10km',
        zone3: '🚚 Zona 3 - Más de 10km'
    };
    return names[type] || 'Recoger en el local';
}

function showNotification(message, type = 'success') {
    // Remover notificación existente si existe
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    if (type === 'error') {
        notification.style.background = 'linear-gradient(135deg, #e53e3e, #c53030)';
    } else if (type === 'info') {
        notification.style.background = 'linear-gradient(135deg, #3182ce, #2b77cb)';
    }

    document.body.appendChild(notification);

    // Remover la notificación después de 3 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 3000);
}

// Función para verificar conexión con el servidor
async function checkServerConnection() {
    try {
        const response = await fetch(`${API_BASE_URL}/health`);
        const result = await response.json();
        
        if (response.ok && result.status === 'ok') {
            console.log('✅ Conexión con servidor exitosa');
            return true;
        } else {
            console.warn('⚠️ Servidor responde pero hay problemas:', result);
            return false;
        }
    } catch (error) {
        console.error('❌ Error de conexión con servidor:', error);
        showNotification('Error de conexión con el servidor. Algunas funciones pueden no estar disponibles.', 'error');
        return false;
    }
}

// Event listeners para cerrar modales al hacer clic fuera de ellos
window.onclick = function(event) {
    const productModal = document.getElementById('product-modal');
    const checkoutModal = document.getElementById('checkout-modal');
    
    if (event.target === productModal) {
        closeModal();
    }
    if (event.target === checkoutModal) {
        closeCheckoutModal();
    }
}

// AGREGAR función de utilidad para verificar conexión con sistema de pedidos
async function verificarConexionPedidos() {
    try {
        const response = await fetch(`${API_BASE_URL}/api/pedidos`);
        if (response.ok) {
            console.log('✅ Conexión con sistema de pedidos OK');
            return true;
        }
    } catch (error) {
        console.warn('⚠️ Sistema de pedidos no disponible:', error);
    }
    return false;
}

// Inicialización
document.addEventListener('DOMContentLoaded', async function() {
    updateCartDisplay();
    
    // Verificar conexión con el servidor
    await checkServerConnection();

    // Verificar conexión con sistema de pedidos
    await verificarConexionPedidos();
    
    console.log('✅ Sistema de menú inicializado correctamente');
    console.log('🔗 API Base URL:', API_BASE_URL);
    console.log('📋 Sistema de pedidos integrado');
});

function notificarNuevoPedido(orderData) {
    console.log('🔔 Nuevo pedido creado:', orderData.order_number);
    
    // Crear evento personalizado para notificar a otras partes del sistema
    const event = new CustomEvent('nuevoPedido', { 
        detail: orderData 
    });
    window.dispatchEvent(event);
}

// Función para detectar tecla Escape y cerrar modales
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
        closeCheckoutModal();
    }
});

// AGREGAR listener para nuevos pedidos (opcional)
window.addEventListener('nuevoPedido', (event) => {
    console.log('🎉 Pedido recibido por el sistema:', event.detail);
});
