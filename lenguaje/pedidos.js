let pedidosData = [];
        let currentStep = 0;
        let preparationTimer = null;
        let isPaused = false;

        // Elementos del DOM
        const loadOrdersBtn = document.getElementById('load-orders');
        const startPreparationBtn = document.getElementById('start-preparation');
        const pausePreparationBtn = document.getElementById('pause-preparation');
        const clearOrdersBtn = document.getElementById('clear-orders');
        const ordersTable = document.getElementById('orders-table');
        const totalSection = document.getElementById('total-section');
        const totalAmount = document.getElementById('total-amount');
        const statusProgress = document.getElementById('status-progress');
        const statusMessage = document.getElementById('status-message');
        const loading = document.getElementById('loading');
        const totalItems = document.getElementById('total-items');
        const orderStatus = document.getElementById('order-status');

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

        // Actualizar estadísticas
        function updateStats() {
            totalItems.textContent = pedidosData.length;
            orderStatus.textContent = currentStep === 0 ? 'Inactivo' : 
                                    currentStep === 1 ? 'Iniciado' : 
                                    currentStep === 2 ? 'En Proceso' : 'Finalizado';
        }

        async function cargarPedidos() {
            loading.style.display = 'block';
            ordersTable.querySelector('tbody').innerHTML = '';
        
            try {
                const response = await fetch('http://localhost:3003/api/pedidos');
                const pedidos = await response.json();
        
                pedidosData = pedidos;
                mostrarPedidos(pedidos);
                startPreparationBtn.disabled = pedidos.length === 0;
        
                showNotification('Pedidos cargados correctamente', 'success');
                updateStats();
            } catch (error) {
                console.error('Error al cargar pedidos:', error);
                showNotification('Error al cargar los pedidos', 'error');
            } finally {
                loading.style.display = 'none';
            }
        }

        // Mostrar pedidos en la tabla
        function mostrarPedidos(pedidos) {
            const tbody = ordersTable.querySelector('tbody');
            tbody.innerHTML = '';

            if (pedidos.length === 0) {
                tbody.innerHTML = `
                    <tr class="empty-state">
                        <td colspan="4">No hay pedidos disponibles</td>
                    </tr>
                `;
                totalSection.style.display = 'none';
                return;
            }

            let total = 0;

            pedidos.forEach((pedido, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${pedido.name}</td>
                    <td>${pedido.product_option}</td>
                    <td>$${parseFloat(pedido.price).toLocaleString()}</td>
                    <td>
                        <span style="background: #ffc107; color: #333; padding: 4px 8px; border-radius: 12px; font-size: 0.8rem; font-weight: bold;">
                            Pendiente
                        </span>
                    </td>
                `;
                tbody.appendChild(row);
                total += parseFloat(pedido.price);
            });

            totalAmount.textContent = `$${total.toLocaleString()}`;
            totalSection.style.display = 'block';
        }

        // Iniciar preparación
        function iniciarPreparacion() {
            if (pedidosData.length === 0) {
                showNotification('No hay pedidos para preparar', 'error');
                return;
            }

            currentStep = 1;
            updateStats();
            startPreparationBtn.disabled = true;
            pausePreparationBtn.disabled = false;
            
            // Actualizar estado visual de los productos
            const rows = ordersTable.querySelectorAll('tbody tr');
            rows.forEach(row => {
                const statusCell = row.querySelector('td:last-child span');
                if (statusCell) {
                    statusCell.style.background = '#dc3545';
                    statusCell.style.color = 'white';
                    statusCell.textContent = 'Iniciado';
                }
            });

            animateStatusStep(1, () => {
                setTimeout(() => {
                    if (!isPaused) {
                        currentStep = 2;
                        updateStats();
                        
                        // Actualizar a "En Proceso"
                        rows.forEach(row => {
                            const statusCell = row.querySelector('td:last-child span');
                            if (statusCell) {
                                statusCell.style.background = '#ffc107';
                                statusCell.style.color = '#333';
                                statusCell.textContent = 'En Proceso';
                            }
                        });

                        animateStatusStep(2, () => {
                            setTimeout(() => {
                                if (!isPaused) {
                                    currentStep = 3;
                                    updateStats();
                                    
                                    // Actualizar a "Finalizado"
                                    rows.forEach(row => {
                                        const statusCell = row.querySelector('td:last-child span');
                                        if (statusCell) {
                                            statusCell.style.background = '#28a745';
                                            statusCell.style.color = 'white';
                                            statusCell.textContent = 'Completado';
                                        }
                                    });

                                    animateStatusStep(3, () => {
                                        statusMessage.style.display = 'block';
                                        showNotification('¡Pedido completado! Listo para servir.', 'success');
                                        pausePreparationBtn.disabled = true;
                                    });
                                }
                            }, 8000);
                        });
                    }
                }, 8000);
            });

            showNotification('Preparación iniciada', 'info');
        }

        // Animar pasos del estado
        function animateStatusStep(step, callback) {
            const steps = document.querySelectorAll('.status-step');
            const progress = statusProgress;
            
            // Marcar pasos anteriores como completados
            for (let i = 0; i < step - 1; i++) {
                steps[i].classList.add('completed');
                steps[i].classList.remove('active');
            }
            
            // Marcar paso actual como activo
            steps[step - 1].classList.add('active');
            steps[step - 1].classList.remove('completed');
            
            // Animar barra de progreso
            const progressWidth = ((step - 1) / 2) * 100;
            progress.style.width = `${progressWidth}%`;
            
            if (callback) callback();
        }

        // Pausar preparación
        function pausarPreparacion() {
            isPaused = !isPaused;
            pausePreparationBtn.textContent = isPaused ? '▶️ Continuar' : '⏸️ Pausar';
            pausePreparationBtn.className = isPaused ? 'btn btn-success' : 'btn btn-warning';
            
            showNotification(isPaused ? 'Preparación pausada' : 'Preparación reanudada', 'info');
        }

        async function limpiarPedidos() {
            if (confirm('¿Estás seguro de que quieres eliminar todos los pedidos?')) {
                try {
                    await fetch('http://localhost:3003/api/pedidos', { method: 'DELETE' });
        
                    pedidosData = [];
                    mostrarPedidos([]);
        
                    // Reset visuales y botones
                    currentStep = 0;
                    isPaused = false;
                    updateStats();
                    startPreparationBtn.disabled = true;
                    pausePreparationBtn.disabled = true;
                    pausePreparationBtn.textContent = '⏸️ Pausar';
                    pausePreparationBtn.className = 'btn btn-warning';
        
                    const steps = document.querySelectorAll('.status-step');
                    steps.forEach(step => step.classList.remove('active', 'completed'));
                    statusProgress.style.width = '0%';
                    statusMessage.style.display = 'none';
        
                    showNotification('Todos los pedidos han sido eliminados', 'success');
                } catch (error) {
                    console.error('Error al eliminar pedidos:', error);
                    showNotification('Error al eliminar los pedidos', 'error');
                }
            }
        }
        

        // Event listeners
        loadOrdersBtn.addEventListener('click', cargarPedidos);
        startPreparationBtn.addEventListener('click', iniciarPreparacion);
        pausePreparationBtn.addEventListener('click', pausarPreparacion);
        clearOrdersBtn.addEventListener('click', limpiarPedidos);

        // Inicializar
        updateStats();




