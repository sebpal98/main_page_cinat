let camera, scene, renderer, earth;

init();
animate();

function init() {
    // Scene setup
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
    );
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Create Earth
    const geometry = new THREE.SphereGeometry(5, 74, 74);
    const textureLoader = new THREE.TextureLoader();

    const material = new THREE.MeshPhongMaterial({
        map: textureLoader.load("assets/textures/earth_texture10k.jpg"),
        bumpMap: textureLoader.load("assets/textures/earth_bump10k.jpg"),
        bumpScale: 0.05,
        shininess: 25,
    });

    earth = new THREE.Mesh(geometry, material);
    scene.add(earth);

    // Add highlights
    const logoTexture = textureLoader.load("assets/logos/logoCINAT.png");

    addHighlight({
        lat: 4.71, // Colombia
        lng: 74.0721,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/colombia.html",
    });

    addHighlight({
        lat: 37.0902, // Estados Unidos
        lng: 95.7129,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/usa.html",
        size: 0.5,
    });

    addHighlight({
        lat: 23.6345, // México
        lng: 102.5528,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/mexico.html",
    });

    addHighlight({
        lat: 13.5333,
        lng: 88.9156,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/guatemala.html",
    }); // Guatemala

    addHighlight({
        lat: 1.8312,
        lng: 78.1834,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/ecuador.html",
    }); // Ecuador

    addHighlight({
        lat: -9.1906,
        lng: 75.0152,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/peru.html",
    }); // Perú

    addHighlight({
        lat: -14.235,
        lng: 51.9253,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/brazil.html",
        size: 0.45,
    }); // Brasil

    addHighlight({
        lat: -38.4161,
        lng: 63.6167,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/argentina.html",
        size: 0.4,
    }); // Argentina

    addHighlight({
        lat: 40.4637,
        lng: -3.7492,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/spain.html",
        size: 0.2,
    }); // España
    addHighlight({
        lat: 42.5078,
        lng: 1.5211,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/andorra.html",
        size: 0.2,
    }); // Andorra

    addHighlight({
        lat: 7.9465,
        lng: -1.0232,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/ghana.html",
    }); // Ghana

    addHighlight({
        lat: 23.4241,
        lng: -53.8478,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/uae.html",
    }); // Emiratos Árabes

    addHighlight({
        lat: 30.3753,
        lng: -69.3451,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/pakistan.html",
        size: 0.2,
    }); // Pakistán

    addHighlight({
        lat: 33.9391,
        lng: -67.7099,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/afghanistan.html",
        size: 0.2,
    }); // Afganistán
    addHighlight({
        lat: 28.3949,
        lng: -84.124,
        radius: 5.1,
        texture: logoTexture,
        url: "countries/nepal.html",
    }); // Nepal

    // Add lighting
    const ambientLight = new THREE.AmbientLight(0x404040);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(50, 50, 50);
    scene.add(pointLight);

    // Position camera
    camera.position.z = 15;

    // Add OrbitControls
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.screenSpacePanning = false;
    controls.minDistance = 10;
    controls.maxDistance = 20;

    // Add event listeners
    window.addEventListener("resize", onWindowResize, true);
    renderer.domElement.addEventListener("click", onDocumentMouseClick);
    renderer.domElement.addEventListener("touchstart", onDocumentMouseClick);
    renderer.domElement.addEventListener("touchend", onDocumentMouseClick);
    renderer.domElement.style.cursor = "pointer"; // Cambiar el cursor para indicar clickabilidad
}

function addHighlight({ lat, lng, radius, texture, url, size = 0.25 }) {
    const highlightGeometry = new THREE.CircleGeometry(size, 32); // Tamaño dinámico basado en el parámetro 'size'
    const highlightMaterial = new THREE.MeshBasicMaterial({
        map: texture,
        opacity: 0.8,
        transparent: true,
        side: THREE.DoubleSide,
    });

    const highlightMesh = new THREE.Mesh(highlightGeometry, highlightMaterial);
    highlightMesh.userData = { clickable: true, url };

    // Convertir coordenadas esféricas a cartesianas
    const latRad = lat * (Math.PI / 180);
    const lngRad = lng * (Math.PI / 180);

    const x = radius * Math.cos(latRad) * Math.cos(lngRad);
    const y = radius * Math.sin(latRad);
    const z = radius * Math.cos(latRad) * Math.sin(lngRad);

    highlightMesh.position.set(x, y, z);
    highlightMesh.lookAt(earth.position);

    scene.add(highlightMesh);

    // Animar el highlight con la rotación de la Tierra
    animateHighlight(highlightMesh, latRad, lngRad, radius);
}

function animateHighlight(mesh, latRad, lngRad, radius) {
    mesh.updateHighlightPosition = () => {
        const adjustedLng = lngRad - earth.rotation.y;
        const x = radius * Math.cos(latRad) * Math.cos(adjustedLng);
        const y = radius * Math.sin(latRad);
        const z = radius * Math.cos(latRad) * Math.sin(adjustedLng);

        mesh.position.set(x, y, z);
        mesh.lookAt(earth.position);
    };
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function onDocumentMouseClick(event) {
    const mouse = new THREE.Vector2();
    
    if (event.type === 'touchstart' || event.type === 'touchend') {
        const touch = event.touches[0];
        mouse.x = (touch.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(touch.clientY / window.innerHeight) * 2 + 1;
    } else {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    }

    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);

    const intersects = raycaster.intersectObjects(scene.children);

    intersects.forEach((intersect) => {
        if (
            intersect.object.userData.clickable &&
            intersect.object.userData.url
        ) {
            window.open(intersect.object.userData.url, "_blank");
        }
    });
}

function animate() {
    requestAnimationFrame(animate);

    // Rotar la Tierra
    earth.rotation.y += 0.0005; // Velocidad de rotación

    // Actualizar posiciones de highlights
    scene.children.forEach((child) => {
        if (child.updateHighlightPosition) {
            child.updateHighlightPosition();
        }
    });

    // Renderizar la escena
    renderer.render(scene, camera);
}
