 // Simulación de datos en tiempo real
 let currentStatus = 2; // 0: confirmado, 1: preparando, 2: en camino, 3: entregado
 let estimatedTime = 12; // minutos
 let currentDistance = 2.3; // km

 // Actualizar información cada 30 segundos
 setInterval(updateDeliveryInfo, 30000);

 function updateDeliveryInfo() {
     // Simular progreso del pedido
     estimatedTime = Math.max(1, estimatedTime - 1);
     currentDistance = Math.max(0.1, currentDistance - 0.2);
     
     document.getElementById('eta').textContent = estimatedTime + ' min';
     document.getElementById('distance').textContent = currentDistance.toFixed(1) + ' km';

     // Cambiar estado cuando llegue
     if (estimatedTime <= 2 && currentStatus === 2) {
         updateOrderStatus(3);
         showNotification('🎉 ¡Tu pedido ha sido entregado! ¡Disfruta tu comida!');
     }
 }

 function updateOrderStatus(newStatus) {
     const steps = document.querySelectorAll('.status-step');
     
     steps.forEach((step, index) => {
         step.classList.remove('completed', 'current', 'pending');
         
         if (index < newStatus) {
             step.classList.add('completed');
         } else if (index === newStatus) {
             step.classList.add('current');
         } else {
             step.classList.add('pending');
         }
     });
     
     currentStatus = newStatus;
 }

 function contactDelivery() {
     const phone = '300-555-0123'; // Número del domiciliario
     if (confirm(`¿Deseas llamar al domiciliario Carlos?\nNúmero: ${phone}`)) {
         window.location.href = `tel:${phone}`;
     }
 }

 function showNotification(message) {
     const notification = document.createElement('div');
     notification.className = 'notification';
     notification.textContent = message;
     document.body.appendChild(notification);

     setTimeout(() => {
         notification.remove();
     }, 5000);
 }

 // Cargar datos del pedido desde localStorage o URL params
 document.addEventListener("DOMContentLoaded", () => {
    let total = 0;
    const bikeImage = document.getElementById("bike-image");
    let moveRight = true;

     // Función para mover la motocicleta
     function moveBike() {
        if (bikeImage) {
            if (moveRight) {
                bikeImage.style.left = '90%';
            } else {
                bikeImage.style.left = '0';
            }
            moveRight = !moveRight;
        }
    }
     // Mueve la imagen cada 2 segundos
     if (bikeImage) {
        setInterval(moveBike, 2000);
    }

    // Cargar datos del pedido si existe
    function loadCurrentOrder() {
        const data = sessionStorage.getItem('invoiceData');
        if (!data) return;
    
        const order = JSON.parse(data);
    
        // Mostrar datos en la interfaz
        document.getElementById('order-number').textContent = order.orderNumber;
        document.getElementById('customer-name').textContent = order.customerName;
        document.getElementById('customer-phone').textContent = order.customerPhone;
        document.getElementById('customer-address').textContent = order.customerAddress;
        document.getElementById('order-total').textContent = '$' + order.total.toLocaleString('es-CO');
    
        // También podrías mostrar los productos
        const itemList = document.getElementById('invoice-items');
        if (itemList && order.items) {
            itemList.innerHTML = '';
            order.items.forEach(item => {
                const div = document.createElement('div');
                div.className = 'invoice-item';
                div.innerHTML = `<span>${item.name} - ${item.product_option} (x${item.quantity})</span><span>$${item.price.toLocaleString('es-CO')}</span>`;
                itemList.appendChild(div);
            });
        }
    }
    

    // Evento para el botón Confirmar Pedido
    const confirmButton = document.getElementById("confirm-button");
    
     
     // Mostrar notificación de bienvenida
     setTimeout(() => {
         showNotification('🍽️ Tu pedido está siendo preparado con amor');
     }, 1000);
 });

 

 // Simular actualizaciones en tiempo real cada 10 segundos
 setInterval(() => {
     const messages = [
         '🏍️ El domiciliario está avanzando por la Carrera 7ma',
         '🚦 Esperando en el semáforo de la Calle 63',
         '🛣️ Tomando la ruta más rápida hacia tu dirección',
         '📍 Ya está cerca de tu barrio',
         '🏠 Buscando la dirección exacta'
     ];
     
     const randomMessage = messages[Math.floor(Math.random() * messages.length)];
     showNotification(randomMessage);
 }, 45000);

 


