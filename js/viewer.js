class TableViewer {
  constructor() {
      this.scene = null;
      this.camera = null;
      this.renderer = null;
      this.model = null;
      this.controls = null;
      this.selectedTable = null;
      this.tableStatus = {};
      this.isLoading = false;
      
      // Configuración de capacidades de mesas
      this.tableCapacities = {
          mesa1: 3, mesa2: 3, mesa3: 2, mesa4: 2, mesa5: 1,
          mesa6: 1, mesa7: 1, mesa8: 6, mesa9: 10, mesa10: 10,
          mesa11: 4, mesa12: 4, mesa13: 4
      };

      this.init();
  }

  init() {
      try {
          this.setupScene();
          this.setupCamera();
          this.setupRenderer();
          this.setupControls();
          this.setupLighting();
          this.loadModel();
          this.setupEventListeners();
          this.animate();
          
          console.log('✅ Visor 3D inicializado correctamente');
      } catch (error) {
          console.error('❌ Error al inicializar el visor 3D:', error);
          this.showError('Error al inicializar el visor 3D');
      }
  }

  setupScene() {
      this.scene = new THREE.Scene();
      this.scene.background = new THREE.Color(0xf5f5f5);
      this.scene.fog = new THREE.Fog(0xf5f5f5, 50, 200);
  }

  setupCamera() {
      this.camera = new THREE.PerspectiveCamera(
          75, 
          window.innerWidth / window.innerHeight, 
          0.1, 
          1000
      );
      this.camera.position.set(0, 10, 15);
  }

  setupRenderer() {
      this.renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true 
      });
      this.renderer.setSize(window.innerWidth, window.innerHeight);
      this.renderer.shadowMap.enabled = true;
      this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      this.renderer.outputEncoding = THREE.sRGBEncoding;
      
      const container = document.getElementById('three-container');
      if (container) {
          container.appendChild(this.renderer.domElement);
      } else {
          console.error('❌ No se encontró el contenedor three-container');
      }
  }

  setupControls() {
      this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
      this.controls.enableDamping = true;
      this.controls.dampingFactor = 0.05;
      this.controls.maxPolarAngle = Math.PI / 2.2;
      this.controls.minDistance = 5;
      this.controls.maxDistance = 50;
  }

  setupLighting() {
      // Luz ambiental
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      this.scene.add(ambientLight);

      // Luz direccional principal
      const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
      directionalLight.position.set(10, 10, 5);
      directionalLight.castShadow = true;
      directionalLight.shadow.mapSize.width = 2048;
      directionalLight.shadow.mapSize.height = 2048;
      this.scene.add(directionalLight);

      // Luz puntual para ambiente
      const pointLight = new THREE.PointLight(0xffa500, 0.3, 50);
      pointLight.position.set(-10, 10, -10);
      this.scene.add(pointLight);
  }

  async loadModel() {
      try {
          this.showLoading(true);
          
          const loader = new THREE.GLTFLoader();
          
          // Usar promesa para mejor manejo de errores
          const gltf = await new Promise((resolve, reject) => {
              loader.load(
                  '/models/model.glb',
                  resolve,
                  (progress) => {
                      const percent = (progress.loaded / progress.total * 100);
                      this.updateLoadingProgress(percent);
                  },
                  reject
              );
          });

          this.model = gltf.scene;
          this.scene.add(this.model);
          
          this.setupModel();
          await this.initializeTableStatus();
          await this.loadTableStates();
          
          this.showLoading(false);
          console.log('✅ Modelo cargado exitosamente');
          
      } catch (error) {
          console.error('❌ Error al cargar el modelo:', error);
          this.showError('Error al cargar el modelo 3D. Verifica que el archivo existe.');
          this.showLoading(false);
      }
  }

  setupModel() {
      if (!this.model) return;

      // Centrar el modelo
      const box = new THREE.Box3().setFromObject(this.model);
      const center = box.getCenter(new THREE.Vector3());
      this.model.position.sub(center);

      // Ajustar cámara según el tamaño del modelo
      const size = box.getSize(new THREE.Vector3());
      const maxDim = Math.max(size.x, size.y, size.z);
      this.camera.position.z = maxDim * 1.5;

      // Configurar sombras en el modelo
      this.model.traverse((child) => {
          if (child.isMesh) {
              child.castShadow = true;
              child.receiveShadow = true;
              
              // Mejorar materiales
              if (child.material) {
                  child.material.needsUpdate = true;
              }
          }
      });
  }

  async initializeTableStatus() {
      for (let i = 1; i <= 13; i++) {
          const tableName = `mesa${i}`;
          this.tableStatus[tableName] = { 
              reserved: false,
              capacity: this.tableCapacities[tableName] || 4,
              color: 0x00ff00 // Verde por defecto
          };
      }
  }

  async loadTableStates() {
      try {
          // Primero intentar cargar desde el endpoint de reservas JSON
          const response = await fetch('/reservados', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          if (response.ok) {
              const reservas = await response.json();
              console.log('✅ Reservas cargadas:', reservas);
              
              // Marcar mesas reservadas
              reservas.forEach(reserva => {
                  if (reserva.mesa_reservada && this.model) {
                      this.markTableAsReserved(reserva.mesa_reservada);
                  }
              });
          } else {
              console.warn('⚠️ No se pudieron cargar las reservas desde /reservados');
              // Intentar cargar desde el endpoint de mesas de la base de datos
              await this.loadTableStatesFromDB();
          }
          
      } catch (error) {
          console.warn('⚠️ Error al cargar reservas desde JSON, intentando desde DB:', error);
          await this.loadTableStatesFromDB();
      }
  }

  async loadTableStatesFromDB() {
      try {
          const response = await fetch('http://localhost:3003/mesas', {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              }
          });
          
          if (response.ok) {
              const mesas = await response.json();
              console.log('✅ Mesas cargadas desde DB:', mesas);
              
              mesas.forEach(mesa => {
                  if (mesa.estado === 'reservada' && this.model) {
                      this.markTableAsReserved(mesa.nombre);
                  }
              });
          } else {
              throw new Error(`Error HTTP: ${response.status}`);
          }
          
      } catch (error) {
          console.warn('⚠️ No se pudieron cargar las mesas desde la base de datos:', error);
      }
  }

  markTableAsReserved(tableName) {
      if (!this.model) return;
      
      const mesa = this.findTableObject(tableName);
      if (mesa && mesa.material) {
          mesa.material.color.setHex(0xff0000); // Rojo para reservada
          this.tableStatus[tableName].reserved = true;
          this.tableStatus[tableName].color = 0xff0000;
          console.log(`🔴 Mesa ${tableName} marcada como reservada`);
      } else {
          console.warn(`⚠️ No se encontró el objeto 3D para ${tableName}`);
      }
  }

  findTableObject(tableName) {
      if (!this.model) return null;
      
      // Buscar por nombre exacto
      let mesa = this.model.getObjectByName(tableName);
      
      // Si no se encuentra, buscar por nombre en minúsculas
      if (!mesa) {
          mesa = this.model.getObjectByName(tableName.toLowerCase());
      }
      
      // Búsqueda más amplia si aún no se encuentra
      if (!mesa) {
          this.model.traverse((child) => {
              if (child.name && child.name.toLowerCase().includes(tableName.toLowerCase())) {
                  mesa = child;
              }
          });
      }
      
      return mesa;
  }

  setupEventListeners() {
      // Click en el modelo
      this.renderer.domElement.addEventListener('click', (event) => {
          this.onModelClick(event);
      });

      // Hover effect
      this.renderer.domElement.addEventListener('mousemove', (event) => {
          this.onModelHover(event);
      });

      // Resize
      window.addEventListener('resize', () => {
          this.onWindowResize();
      });

      // Teclado
      document.addEventListener('keydown', (event) => {
          this.onKeyDown(event);
      });
  }

  onModelClick(event) {
      if (!this.model || event.target !== this.renderer.domElement) return;

      const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      const intersects = raycaster.intersectObject(this.model, true);

      if (intersects.length > 0) {
          const clickedObject = intersects[0].object;
          this.handleTableClick(clickedObject);
      }
  }

  onModelHover(event) {
      if (!this.model) return;

      const mouse = new THREE.Vector2(
          (event.clientX / window.innerWidth) * 2 - 1,
          -(event.clientY / window.innerHeight) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, this.camera);

      const intersects = raycaster.intersectObject(this.model, true);

      // Cambiar cursor
      this.renderer.domElement.style.cursor = intersects.length > 0 ? 'pointer' : 'default';
  }

  async handleTableClick(clickedObject) {
      const tableName = this.getTableNameFromObject(clickedObject);
      
      if (!tableName) {
          console.warn('⚠️ No se pudo identificar la mesa');
          this.showMessage('No se pudo identificar la mesa seleccionada', 'warning');
          return;
      }

      console.log(`🖱️ Mesa clickeada: ${tableName}`);

      // Verificar si ya está reservada localmente
      if (this.tableStatus[tableName]?.reserved) {
          this.showMessage(`La ${tableName} ya está reservada.`, 'warning');
          return;
      }

      try {
          // Verificar estado en el servidor con manejo de errores mejorado
          const response = await this.fetchWithTimeout(`http://localhost:3003/mesa/${tableName}`, {
              method: 'GET',
              headers: {
                  'Content-Type': 'application/json'
              }
          }, 5000); // Timeout de 5 segundos

          if (!response.ok) {
              if (response.status === 404) {
                  console.warn(`⚠️ Mesa ${tableName} no encontrada en la base de datos`);
                  // Proceder como si fuera una mesa disponible
                  this.showTableSelection(tableName, { 
                      estado: 'disponible', 
                      capacidad: this.tableCapacities[tableName] || 4 
                  });
                  return;
              } else {
                  throw new Error(`Error HTTP ${response.status}: ${response.statusText}`);
              }
          }

          const data = await response.json();
          console.log(`📊 Estado de ${tableName}:`, data);

          if (data.estado === 'reservada') {
              this.showMessage(`${tableName} ya está reservada.`, 'warning');
              this.markTableAsReserved(tableName);
              return;
          }

          // Mesa disponible - mostrar confirmación
          this.showTableSelection(tableName, data);

      } catch (error) {
          console.error('❌ Error al verificar mesa:', error);
          
          // Manejar diferentes tipos de errores
          if (error.name === 'AbortError') {
              this.showMessage('Tiempo de espera agotado. Inténtalo de nuevo.', 'error');
          } else if (error.message.includes('Failed to fetch')) {
              this.showMessage('Error de conexión. Verifica tu conexión a internet.', 'error');
          } else {
              this.showMessage('Error al verificar el estado de la mesa. Inténtalo nuevamente.', 'error');
          }
      }
  }

  // Función auxiliar para fetch con timeout
  async fetchWithTimeout(url, options = {}, timeout = 5000) {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeout);
      
      try {
          const response = await fetch(url, {
              ...options,
              signal: controller.signal
          });
          clearTimeout(id);
          return response;
      } catch (error) {
          clearTimeout(id);
          throw error;
      }
  }

  getTableNameFromObject(object) {
      // Intentar obtener nombre del objeto
      if (object.name && object.name.includes('mesa')) {
          return object.name;
      }

      // Buscar en el padre
      let parent = object.parent;
      while (parent) {
          if (parent.name && parent.name.includes('mesa')) {
              return parent.name;
          }
          parent = parent.parent;
      }

      // Si no se encuentra, generar nombre basado en posición
      console.warn('⚠️ No se pudo determinar el nombre de la mesa desde el objeto 3D');
      const mesaNum = Math.floor(Math.random() * 13) + 1;
      return `mesa${mesaNum}`;
  }

  showTableSelection(tableName, tableData) {
      const capacity = this.tableCapacities[tableName] || tableData.capacidad || 4;
      const message = `¿Desea reservar la ${tableName}?\n\nCapacidad: ${capacity} personas\nEstado: Disponible`;
      
      if (confirm(message)) {
          this.reserveTable(tableName);
      }
  }

  async reserveTable(tableName) {
      if (this.isLoading) {
          this.showMessage('Ya hay una reserva en proceso...', 'warning');
          return;
      }
      
      try {
          this.isLoading = true;
          this.showMessage('Reservando mesa...', 'info');

          const response = await this.fetchWithTimeout('http://localhost:3003/reservar', {
              method: 'POST',
              headers: { 
                  'Content-Type': 'application/json'
              },
              body: JSON.stringify({ 
                  nombre: tableName, 
                  hora_inicio: '00:00:00', 
                  hora_fin: '23:59:59' 
              })
          }, 10000); // Timeout más largo para reservas

          if (!response.ok) {
              const errorData = await response.json().catch(() => ({}));
              throw new Error(errorData.message || `Error HTTP ${response.status}`);
          }

          const result = await response.json();
          console.log('✅ Reserva exitosa:', result);

          // Actualizar visualmente
          this.markTableAsReserved(tableName);
          this.selectedTable = tableName;
          
          this.updateUI(tableName);
          this.showMessage('¡Mesa reservada exitosamente!', 'success');
          
      } catch (error) {
          console.error('❌ Error al reservar mesa:', error);
          
          if (error.name === 'AbortError') {
              this.showMessage('Tiempo de espera agotado al reservar. Inténtalo de nuevo.', 'error');
          } else if (error.message.includes('Failed to fetch')) {
              this.showMessage('Error de conexión al reservar. Verifica tu conexión.', 'error');
          } else {
              this.showMessage(error.message || 'Error al reservar mesa', 'error');
          }
      } finally {
          this.isLoading = false;
      }
  }

  updateUI(tableName) {
      const mesaInfo = document.getElementById('mesa-info');
      const nextButton = document.getElementById('nextButton');
      
      if (mesaInfo) {
          mesaInfo.textContent = `✅ Seleccionaste ${tableName}`;
          mesaInfo.style.color = '#4CAF50';
          mesaInfo.style.fontWeight = 'bold';
      }
      
      if (nextButton) {
          nextButton.classList.add('show');
          nextButton.style.animation = 'fadeIn 0.3s ease-in';
      }
  }

  onKeyDown(event) {
      switch(event.code) {
          case 'Escape':
              this.clearSelection();
              break;
          case 'KeyR':
              this.resetCamera();
              break;
          case 'Space':
              event.preventDefault();
              if (this.selectedTable) {
                  this.redirectToReserved();
              }
              break;
      }
  }

  clearSelection() {
      this.selectedTable = null;
      const mesaInfo = document.getElementById('mesa-info');
      const nextButton = document.getElementById('nextButton');
      
      if (mesaInfo) {
          mesaInfo.textContent = 'Haz clic en una mesa para seleccionarla.';
          mesaInfo.style.color = '';
          mesaInfo.style.fontWeight = '';
      }
      
      if (nextButton) {
          nextButton.classList.remove('show');
      }
  }

  resetCamera() {
      if (this.controls) {
          this.controls.reset();
          this.camera.position.set(0, 10, 15);
          this.controls.update();
      }
  }

  redirectToReserved() {
      if (this.selectedTable) {
          // Verificar si localStorage está disponible
          try {
              localStorage.setItem('mesaSeleccionada', this.selectedTable);
              localStorage.setItem('mesaCapacidad', this.tableCapacities[this.selectedTable] || 4);
          } catch (e) {
              console.warn('⚠️ localStorage no disponible, usando variables de sesión');
              // Alternativa sin localStorage
              window.mesaSeleccionada = this.selectedTable;
              window.mesaCapacidad = this.tableCapacities[this.selectedTable] || 4;
          }
          
          // Navegar con animación
          document.body.style.opacity = '0';
          setTimeout(() => {
              window.location.href = 'html/reservados.html';
          }, 300);
      } else {
          this.showMessage('Por favor selecciona una mesa primero', 'warning');
      }
  }

  onWindowResize() {
      if (this.camera && this.renderer) {
          this.camera.aspect = window.innerWidth / window.innerHeight;
          this.camera.updateProjectionMatrix();
          this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
  }

  showLoading(show) {
      let loader = document.getElementById('loading-overlay');
      
      if (show && !loader) {
          loader = document.createElement('div');
          loader.id = 'loading-overlay';
          loader.innerHTML = `
              <div class="loading-content">
                  <div class="spinner"></div>
                  <p>Cargando modelo 3D...</p>
                  <div class="progress-bar">
                      <div class="progress-fill" id="progress-fill"></div>
                  </div>
              </div>
          `;
          document.body.appendChild(loader);
      } else if (!show && loader) {
          loader.remove();
      }
  }

  updateLoadingProgress(percent) {
      const progressFill = document.getElementById('progress-fill');
      if (progressFill) {
          progressFill.style.width = `${percent}%`;
      }
  }

  showMessage(message, type = 'info') {
      // Remover mensaje anterior
      const existingMessage = document.querySelector('.toast-message');
      if (existingMessage) {
          existingMessage.remove();
      }

      const toast = document.createElement('div');
      toast.className = `toast-message toast-${type}`;
      toast.textContent = message;
      
      document.body.appendChild(toast);
      
      // Animar entrada
      setTimeout(() => toast.classList.add('show'), 100);
      
      // Auto-remover después de 4 segundos para errores, 3 para otros
      const duration = type === 'error' ? 4000 : 3000;
      setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => {
              if (toast.parentNode) {
                  toast.remove();
              }
          }, 300);
      }, duration);
  }

  showError(message) {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'error-message';
      errorDiv.innerHTML = `
          <h3>⚠️ Error</h3>
          <p>${message}</p>
          <button onclick="location.reload()">Recargar</button>
      `;
      document.body.appendChild(errorDiv);
  }

  animate() {
      requestAnimationFrame(() => this.animate());
      
      if (this.controls) {
          this.controls.update();
      }
      
      if (this.renderer && this.scene && this.camera) {
          this.renderer.render(this.scene, this.camera);
      }
  }

  destroy() {
      // Limpiar recursos
      if (this.renderer) {
          this.renderer.dispose();
      }
      
      if (this.controls) {
          this.controls.dispose();
      }
      
      // Remover event listeners
      window.removeEventListener('resize', this.onWindowResize);
      document.removeEventListener('keydown', this.onKeyDown);
  }
}

// Funciones globales para compatibilidad
let tableViewer;

function resetCamera() {
  if (tableViewer) {
      tableViewer.resetCamera();
  }
}

function redirectToReserved() {
  if (tableViewer) {
      tableViewer.redirectToReserved();
  }
}

// Inicializar cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Inicializando TableViewer...');
  tableViewer = new TableViewer();
});

// Limpiar al salir
window.addEventListener('beforeunload', () => {
  if (tableViewer) {
      tableViewer.destroy();
  }
});

