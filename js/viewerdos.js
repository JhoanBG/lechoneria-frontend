let scene, camera, renderer, model, controls;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    // Configurar la cámara
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

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

    // Añadir luz ambiental
    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    // Cargar el modelo GLTF
    const loader = new THREE.GLTFLoader();
    loader.load(
        '/models/model.glb',
        function (gltf) {
            model = gltf.scene;
            scene.add(model);

            // Centrar el modelo en la escena
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);

            // Ajustar la cámara para ver todo el modelo
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

    // Agregar un evento de clic para cambiar el color del modelo
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

// Función para manejar el redimensionamiento de la ventana
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Función para manejar clics en el modelo
function onModelClick(event) {
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
        const newColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        intersects[0].object.material.color.set(newColor);
    }
}

// Escuchar el redimensionamiento de la ventana
window.addEventListener('resize', onWindowResize, false);

// Iniciar la aplicación
init();
