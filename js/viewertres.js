let scene, camera, renderer, model, controls;
let tableStatus = {}; // Estado de cada mesa

// Inicialización de Three.js
function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Configurar la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 10;

    // Configurar el renderizador
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('three-container').appendChild(renderer.domElement);

    // Agregar controles de órbita
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    // Añadir luz ambiental y direccional
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(1, 1, 1).normalize();
    scene.add(directionalLight);

    // Cargar el modelo GLTF
    const loader = new THREE.GLTFLoader();
    loader.load(
        '/models/model.glb',
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            initializeTableStatus(); // Inicializar estado de mesas

            // Ajustar la cámara para ver todo el modelo
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
            camera.position.z = cameraZ * 1.5;

            controls.update();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% cargado');
        },
        function (error) {
            console.error('Error al cargar el modelo', error);
        }
    );

    // Agregar evento de clic para reservar mesas
    renderer.domElement.addEventListener('click', onModelClick, false);

    // Animar la escena
    animate();
}

// Función de animación
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

// Función para manejar clics en el modelo
function onModelClick(event) {
    if (!model) return; // Evitar errores si el modelo no ha cargado

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Convertir la posición del mouse a coordenadas normalizadas
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Configurar el raycaster
    raycaster.setFromCamera(mouse, camera);

    // Intersección de rayos con el modelo
    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
        const clickedObject = intersects[0].object;
        const tableName = clickedObject.name;

        if (!tableStatus[tableName]) {
            console.error(`No se encontró información para la mesa ${tableName}`);
            return;
        }

        console.log(`📌 Mesa seleccionada: ${tableName}`);

        // Verificar estado en el servidor
        fetch(`http://localhost:3003/mesa/${tableName}`)
            .then(response => response.json())
            .then(data => {
                if (data.estado === 'reservada') {
                    alert(`La ${tableName} está reservada.`);
                } else {
                    const reserve = confirm(getTableMessage(tableName));
                    if (reserve) {
                        clickedObject.material.color.setHex(0xffff00); // Amarillo mientras se reserva

                        fetch('http://localhost:3003/reservar', {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                nombre: tableName, 
                                hora_inicio: '',  // ⏰ Hora de prueba
                                hora_fin: ''  // ⏰ Hora de prueba
                            })
                        })
                        .then(response => response.json())
                        .then(result => {
                            if (result.message === 'Mesa reservada exitosamente') {
                                tableStatus[tableName].reserved = true;
                                clickedObject.material.color.setHex(0xff0000); // Rojo = reservada
                                window.location.href = 'http://127.0.0.1:5502/infraest/reservados.html';
                            } else {
                                alert(result.message);
                                clickedObject.material.color.setHex(0x00ff00); // Verde = disponible
                            }
                        })
                        .catch(error => {
                            console.error('Error al reservar la mesa:', error);
                            clickedObject.material.color.setHex(0x00ff00); // Revertir color en error
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Error al obtener el estado de la mesa:', error);
            });
    }
}

// Mensajes según la mesa
function getTableMessage(tableName) {
    switch (tableName) {
        case 'mesa1':
        case 'mesa2':
            return `La ${tableName} está disponible para tres personas. ¿Desea reservarla?`;
        case 'mesa3':
        case 'mesa4':
            return `La ${tableName} está disponible para dos personas. ¿Desea reservarla?`;
        case 'mesa5':
        case 'mesa6':
        case 'mesa7':
            return `La ${tableName} está disponible para una persona. ¿Desea reservarla?`;
        case 'mesa8':
            return `La ${tableName} está disponible para seis personas. ¿Desea reservarla?`;
        case 'mesa9':
        case 'mesa10':
            return `La ${tableName} está disponible para diez personas. ¿Desea reservarla?`;
        case 'mesa11':
        case 'mesa12':
        case 'mesa13':
            return `La ${tableName} está disponible para cuatro personas. ¿Desea reservarla?`;
        default:
            return `¿Desea reservar la ${tableName}?`;
    }
}

// Inicializar estado de las mesas
function initializeTableStatus() {
    for (let i = 1; i <= 13; i++) {
        tableStatus[`mesa${i}`] = { reserved: false };
    }
}

// Ajuste de tamaño de ventana
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Iniciar
init();