let mesasData = [];
let filterStatus = 'all';

// Mostrar notificaciones
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.classList.add('show'), 100);
    setTimeout(() => {
      notification.classList.remove('show');
      setTimeout(() => document.body.removeChild(notification), 300);
    }, 3000);
  }

  function updateStats() {
    const total = mesasData.length;
    const entregadas = mesasData.filter(mesa => mesa.entregado).length;
    const pendientes = total - entregadas;
    
    document.getElementById('total-mesas').textContent = total;
    document.getElementById('mesas-pendientes').textContent = pendientes;
    document.getElementById('mesas-entregadas').textContent = entregadas;
    document.getElementById('ultimo-update').textContent = new Date().toLocaleTimeString('es-ES', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function filterMesas() {
    const filteredMesas = mesasData.filter(mesa => {
      if (filterStatus === 'all') return true;
      if (filterStatus === 'pendiente') return !mesa.entregado;
      if (filterStatus === 'entregado') return mesa.entregado;
      return true;
    });
    
    renderMesas(filteredMesas);
  }

// Renderizar mesas
function renderMesas(mesas) {
    const container = document.getElementById('mesas-container');
    const emptyState = document.getElementById('empty-state');
    
    if (mesas.length === 0) {
      container.style.display = 'none';
      emptyState.style.display = 'block';
      return;
    }
    
    container.style.display = 'grid';
    emptyState.style.display = 'none';
    container.innerHTML = '';
  
    mesas.forEach((reserva, index) => {
      const mesaCard = document.createElement('div');
      mesaCard.className = `mesa-card ${reserva.entregado ? 'entregado' : ''}`;
  
      mesaCard.innerHTML = `
        <div class="mesa-header">
          <h2 class="mesa-title">${reserva.mesa_reservada || 'Mesa Desconocida'}</h2>
          <span class="mesa-status ${reserva.entregado ? 'status-entregado' : 'status-pendiente'}">
            ${reserva.entregado ? 'Entregado' : 'Pendiente'}
          </span>
        </div>
        
        <div class="mesa-info">
          <div class="info-row">
            <div class="info-icon">👤</div>
            <span class="info-label">Nombre:</span>
            <span class="info-value">${reserva.name || 'No registrado'} ${reserva.lastname || ''}</span>
          </div>
          <div class="info-row">
            <div class="info-icon">🆔</div>
            <span class="info-label">Cédula:</span>
            <span class="info-value">${reserva.cedula || 'No registrado'}</span>
          </div>
          <div class="info-row">
            <div class="info-icon">🕐</div>
            <span class="info-label">Hora:</span>
            <span class="info-value">${reserva.hora_inicio || 'No disponible'}</span>
          </div>
          <div class="info-row">
            <div class="info-icon">📝</div>
            <span class="info-label">Motivo:</span>
            <span class="info-value">${reserva.reason || 'No especificado'}</span>
          </div>
          <div class="info-row">
            <div class="info-icon">🎉</div>
            <span class="info-label">Decoración:</span>
            <span class="info-value">${reserva.decorations || 'Ninguna'}</span>
          </div>
        </div>
        
        <div class="mesa-actions">
          <button class="action-btn btn-entregado" 
                  onclick="toggleEntregado('${reserva.id || index}')" 
                  ${reserva.entregado ? 'disabled' : ''}>
            ${reserva.entregado ? '✅ Entregado' : '📋 Marcar Entregado'}
          </button>
          <button class="action-btn btn-eliminar" onclick="eliminarReserva('${reserva.id || index}')">
            🗑️ Eliminar
          </button>
        </div>
      `;

        container.appendChild(mesaCard);
    });
}

// Marcar como entregado
async function toggleEntregado(reservaId) {
    try {
      const response = await fetch(`http://localhost:3005/reservados/${reservaId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entregado: true })
      });
  
      if (response.ok) {
        const mesa = mesasData.find(m => m.id == reservaId);
        if (mesa) {
          mesa.entregado = true;
          showNotification(`Mesa ${mesa.mesa_reservada} marcada como entregada`, 'success');
          updateStats();
          filterMesas();
        }
      }
    } catch (error) {
      console.error('Error al actualizar:', error);
      showNotification('Error al marcar como entregado', 'error');
    }
  }

// Editar reserva (placeholder)
function editarReserva(index) {
    const mesa = mesasData[index];
    showNotification('Función de edición en desarrollo', 'error');
    // Aquí implementarías la lógica de edición
}

async function eliminarReserva(reservaId) {
    if (confirm('¿Estás seguro de que quieres eliminar esta reserva?')) {
      try {
        const response = await fetch(`http://localhost:3005/reservados/${reservaId}`, {
          method: 'DELETE'
        });
  
        if (response.ok) {
          showNotification('Reserva eliminada correctamente', 'success');
          cargarMesas();
        }
      } catch (error) {
        console.error('Error al eliminar:', error);
        showNotification('Error al eliminar la reserva', 'error');
      }
    }
  }

// Cargar mesas desde el servidor
async function cargarMesas() {
    const loading = document.getElementById('loading');
    const container = document.getElementById('mesas-container');
    
    loading.style.display = 'block';
    container.style.display = 'none';
    
    try {
        const response = await fetch('http://localhost:3005/reservados');
        const reservas = await response.json();
    
        mesasData = reservas;
        updateStats();
        filterMesas();
        showNotification('Reservas actualizadas correctamente', 'success');
        
      } catch (error) {
        console.error('Error al cargar las reservas:', error);
        showNotification('Error al cargar las reservas', 'error');
        
        // Datos de ejemplo si falla la conexión
        mesasData = [];
      } finally {
        loading.style.display = 'none';
      }
    }

// Event listeners
document.getElementById('filter-status').addEventListener('change', (e) => {
    filterStatus = e.target.value;
    filterMesas();
});

// Auto-refresh cada 30 segundos
setInterval(cargarMesas, 30000);

// Cargar mesas al iniciar
window.onload = cargarMesas;



   
