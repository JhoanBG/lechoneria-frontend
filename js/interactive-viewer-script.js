let scene, camera, renderer, model, controls;

function init() {
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0xcccccc);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    renderer = new THREE.WebGLRenderer();
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Agregar OrbitControls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Agrega suavidad a los controles
    controls.dampingFactor = 0.25;
    controls.screenSpacePanning = false;
    controls.maxPolarAngle = Math.PI / 2;

    const light = new THREE.AmbientLight(0xffffff, 1);
    scene.add(light);

    const loader = new THREE.GLTFLoader();
    loader.load(
        '/models/model.glb',
        function (gltf) {
            model = gltf.scene;
            scene.add(model);
            
            // Centramos el modelo en la escena
            const box = new THREE.Box3().setFromObject(model);
            const center = box.getCenter(new THREE.Vector3());
            model.position.sub(center);
            
            // Ajustamos la cámara para que se vea todo el modelo
            const size = box.getSize(new THREE.Vector3());
            const maxDim = Math.max(size.x, size.y, size.z);
            const fov = camera.fov * (Math.PI / 180);
            let cameraZ = Math.abs(maxDim / 2 * Math.tan(fov * 2));
            camera.position.z = cameraZ * 1.5; // Multiplicamos por 1.5 para dar un poco de espacio extra
            
            // Actualizamos los controles
            controls.update();
        },
        function (xhr) {
            console.log((xhr.loaded / xhr.total * 100) + '% cargado');
        },
        function (error) {
            console.error('Un error ocurrió al cargar el modelo', error);
        }
    );

    // Agregar evento de clic para cambiar el color del modelo
    renderer.domElement.addEventListener('click', onModelClick, false);

    animate();
}

function animate() {
    requestAnimationFrame(animate);
    controls.update(); // Actualizar controles en cada frame
    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onModelClick(event) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Calcular la posición del mouse en coordenadas normalizadas (-1 a +1)
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    // Actualizar el raycaster con la cámara y la posición del mouse
    raycaster.setFromCamera(mouse, camera);

    // Calcular objetos que intersectan con el rayo
    const intersects = raycaster.intersectObject(model, true);

    if (intersects.length > 0) {
        // Cambiar el color del objeto clickeado
        const newColor = new THREE.Color(Math.random(), Math.random(), Math.random());
        intersects[0].object.material.color.set(newColor);
    }
}

window.addEventListener('resize', onWindowResize, false);

init();
