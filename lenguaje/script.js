// Variables globales
let chatOpen = false;
const chatContainer = document.getElementById('chatContainer');
const chatBox = document.getElementById('chatBox');
const chatInput = document.getElementById('chatInput');

// Animación de entrada
window.addEventListener('load', () => {
  const container = document.querySelector('.main-container');
  container.classList.add('loading');
  setTimeout(() => {
    showChatNotification();
  }, 3000);
});

function showChatNotification() {
  const chatWidget = document.getElementById('chatWidget');
  chatWidget.classList.add('pulse-notification');
  setTimeout(() => {
    chatWidget.classList.remove('pulse-notification');
  }, 2000);
}

function toggleChat() {
  chatOpen = !chatOpen;
  chatContainer.style.display = chatOpen ? 'flex' : 'none';
  if (chatOpen) {
    chatContainer.style.animation = 'slideUp 0.3s ease-out';
    chatInput.focus();
  }
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function sendMessage() {
  const message = chatInput.value.trim();
  if (message === '') return;
  displayMessage(message, 'user');
  chatInput.value = '';
  setTimeout(() => {
    showTypingIndicator();
    setTimeout(() => {
      hideTypingIndicator();
      respondToMessage(message);
    }, 1500);
  }, 500);
}

function displayMessage(message, sender) {
  const messageDiv = document.createElement('div');
  messageDiv.className = `chat-message ${sender}-message`;
  messageDiv.innerHTML = sender === 'user'
    ? `<div class="message-content">${message}</div><div class="message-avatar">😊</div>`
    : `<div class="message-avatar">👵</div><div class="message-content">${message}</div>`;
  chatBox.appendChild(messageDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function showTypingIndicator() {
  const typingDiv = document.createElement('div');
  typingDiv.className = 'chat-message bot-message typing-indicator';
  typingDiv.id = 'typingIndicator';
  typingDiv.innerHTML = `<div class="message-avatar">👵</div><div class="message-content"><div class="typing-dots"><span></span><span></span><span></span></div></div>`;
  chatBox.appendChild(typingDiv);
  chatBox.scrollTop = chatBox.scrollHeight;
}

function hideTypingIndicator() {
  const typing = document.getElementById('typingIndicator');
  if (typing) typing.remove();
}

function respondToMessage(message) {
  let response;
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('hola') || lowerMessage.includes('buenos') || lowerMessage.includes('buenas')) {
    response = `¡Hola, querido! 🤗 Qué gusto verte por aquí. Te doy la bienvenida a nuestra lechonería familiar.`;
    displayMessage(response, 'bot');
    setTimeout(() => {
      const options = `¿Qué te gustaría hacer hoy?<br><br>
        <div class="chat-options">
          <button onclick="showMenu()" class="chat-option-btn">🍖 Ver Menú</button>
          <button onclick="showReservation()" class="chat-option-btn">📅 Hacer Reserva</button>
          <button onclick="showBeverage()" class="chat-option-btn">🍺 Ver Bebidas</button>
          <button onclick="showHistory()" class="chat-option-btn">📖 Nuestra Historia</button>
        </div>`;
      displayMessage(options, 'bot');
    }, 1000);

  } else if (lowerMessage.includes('menu') || lowerMessage.includes('comida') || lowerMessage.includes('platos')) {
    showMenu();
  } else if (lowerMessage.includes('reserva') || lowerMessage.includes('mesa')) {
    showReservation();
  } else if (lowerMessage.includes('bebida') || lowerMessage.includes('tomar')) {
    showBeverage();
  } else if (lowerMessage.includes('historia') || lowerMessage.includes('origen')) {
    showHistory();
  } else if (lowerMessage.includes('precio') || lowerMessage.includes('costo') || lowerMessage.includes('cuanto')) {
    response = `💰 Nuestros precios son muy accesibles, querido. El lechón completo está desde $25, porciones desde $8.`;
    displayMessage(response, 'bot');
  } else if (lowerMessage.includes('horario') || lowerMessage.includes('abierto') || lowerMessage.includes('hora')) {
    response = `🕐 Estamos abiertos todos los días:<br>Lunes a Viernes: 11:00 AM - 9:00 PM<br>Sábados y Domingos: 10:00 AM - 10:00 PM`;
    displayMessage(response, 'bot');
  } else if (lowerMessage.includes('opciones') || lowerMessage.includes('acceso') || lowerMessage.includes('entrar')) {
    const accessOptions = `👇 Aquí tienes algunas opciones rápidas:<br><br>
      <div class="chat-options">
        <button class="chat-option-btn" style="background-color: green;" onclick="redirectToPage('https://visitapp.herokuapp.com/')">📅 Reservas</button>
        <button class="chat-option-btn" style="background-color: green;" onclick="redirectToPage('/public/html/quintomenu.html')">🍖 Ver Menú</button>
        <button class="chat-option-btn" style="background-color: green;" onclick="redirectToPage('/public/html/bebidasdos.html')">🍹 Ver Bebidas</button>
      </div>`;
    displayMessage(accessOptions, 'bot');
  } else {
    response = `Disculpa, querido, no entendí bien tu pregunta. 😅`;
    displayMessage(response, 'bot');
  }
}

function showMenu() {
  const menuResponse = `🍖 <strong>NUESTRO MENÚ ESPECIAL</strong><br>• Lechón entero - $45<br>• Porción individual - $8<br>• Acompañamientos varios<br>• Postres caseros`;
  displayMessage(menuResponse, 'bot');
  
  setTimeout(() => {
    const menuOptions = `<br><br><button onclick='redirectToPage("quintomenu.html")' class='chat-option-btn' style='background-color: #059669; margin-top: 10px;'>📖 Ver Menú Completo</button>`;
    displayMessage(menuOptions, 'bot');
  }, 1000);
}

function showReservation() {
  const reservationResponse = `📅 <strong>HACER RESERVA</strong><br>¡Perfecto! Para hacer tu reserva puedes:<br>📞 Llamarnos: (555) 123-4567<br>📱 WhatsApp: (555) 987-6543<br><br>O dime cuántas personas son y para qué fecha, ¡y yo te ayudo a coordinar!`;
  displayMessage(reservationResponse, 'bot');
  
  setTimeout(() => {
    const reservationButton = `<br><br><button onclick='redirectToPage("http://localhost:3000/")' class='chat-option-btn' style='background-color: #059669; margin-top: 10px;'>📅 Hacer Reserva Directa</button>`;
    displayMessage(reservationButton, 'bot');
  }, 1000);
}

function showBeverage() {
  const beverageResponse = `🍺 <strong>NUESTRAS BEBIDAS</strong><br>• Cervezas artesanales y comerciales<br>• Refrescos naturales<br>• Jugos frescos<br>• Bebidas calientes`;
  displayMessage(beverageResponse, 'bot');
  
  setTimeout(() => {
    const beverageButton = `<br><br><button onclick='redirectToPage("bebidasdos.html")' class='chat-option-btn' style='background-color: #059669; margin-top: 10px;'>🍹 Ver Carta de Bebidas</button>`;
    displayMessage(beverageButton, 'bot');
  }, 1000);
}



function orderNow() {
  const orderResponse = `🛒 Para ordenar, contáctanos por WhatsApp o por llamada.`;
  displayMessage(orderResponse, 'bot');
}

// Redirigir a otra página
function redirectToPage(url) {
  window.location.href = url;
}

document.querySelectorAll('.btn').forEach(btn => {
  btn.addEventListener('mouseenter', () => {
    btn.style.transform = 'translateY(-3px) scale(1.02)';
  });
  btn.addEventListener('mouseleave', () => {
    btn.style.transform = 'translateY(0) scale(1)';
  });
});

const features = document.querySelectorAll('.feature');
features.forEach((feature, index) => {
  feature.style.animationDelay = `${index * 0.2}s`;
});