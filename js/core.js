// --- START OF FILE js/core.js ---

// --- SHADERS ---
const vertexShaderText = `
    attribute float size;
    varying vec3 vColor;
    void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
    }
`;

const fragmentShaderText = `
    varying vec3 vColor;
    void main() {
        vec2 xy = gl_PointCoord.xy - vec2(0.5);
        float ll = length(xy);
        if(ll > 0.5) discard;
        float alpha = (0.5 - ll) * 2.0;
        gl_FragColor = vec4(vColor, alpha);
    }
`;

// --- THREE.JS SETUP ---
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// --- DRAG AND DROP HANDLERS ---
const canvas = renderer.domElement;
const dragDropOverlay = document.getElementById('drag-drop-overlay');

canvas.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragDropOverlay.classList.add('active');
});

canvas.addEventListener('dragleave', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!canvas.contains(e.relatedTarget)) {
        dragDropOverlay.classList.remove('active');
    }
});

canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();

    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];

        if (file.type.startsWith('audio/')) {
            dragDropOverlay.classList.remove('active');
            startAudioFile(file);
        } else {
            const txt = document.getElementById('drag-drop-text');
            txt.innerText = ":: FILE NOT SUPPORTED ::";
            txt.style.color = "#ff3333";
            txt.style.borderColor = "#ff3333";
            txt.style.boxShadow = "0 0 50px rgba(255, 51, 51, 0.4)";
            dragDropOverlay.style.outlineColor = "#ff3333";

            setTimeout(() => {
                dragDropOverlay.classList.remove('active');
                setTimeout(() => {
                    txt.innerText = ":: DROP AUDIO DATA ::";
                    txt.style.color = "";
                    txt.style.borderColor = "";
                    txt.style.boxShadow = "";
                    dragDropOverlay.style.outlineColor = "";
                }, 300);
            }, 1500);
        }
    } else {
        dragDropOverlay.classList.remove('active');
    }
});

const renderScene = new THREE.RenderPass(scene, camera);

// --- POST PROCESSING ---
afterimagePass = new THREE.AfterimagePass();
afterimagePass.uniforms['damp'].value = 0.75;

const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.1);

composer = new THREE.EffectComposer(renderer);
composer.addPass(renderScene);
composer.addPass(afterimagePass);
composer.addPass(bloomPass);

const shaderMaterial = new THREE.ShaderMaterial({
    uniforms: {},
    vertexShader: vertexShaderText,
    fragmentShader: fragmentShaderText,
    blending: THREE.AdditiveBlending,
    depthTest: false,
    transparent: true,
    vertexColors: true
});

// --- PARTICLE SYSTEM LOGIC ---
function initParticles(newCount) {
    if (particles) {
        scene.remove(particles);
        geometry.dispose();
    }

    COUNT = parseInt(newCount);
    console.log("Initializing Particles: " + COUNT);

    geometry = new THREE.BufferGeometry();
    posArray = new Float32Array(COUNT * 3);
    colArray = new Float32Array(COUNT * 3);
    sizeArray = new Float32Array(COUNT);
    targetArray = new Float32Array(COUNT * 3);
    secretTargetArray = new Float32Array(COUNT * 3);
    faceTargetArray = new Float32Array(COUNT * 3);
    faceColorArray = new Float32Array(COUNT * 3);

    for (let i = 0; i < COUNT * 3; i++) {
        // Initialize everything with random spread
        const rand = (Math.random() - 0.5) * 200;
        posArray[i] = rand;
        colArray[i] = 1.0;
        targetArray[i] = rand;

        // Initialize Secret Target with random too (placeholder until model loads)
        secretTargetArray[i] = (Math.random() - 0.5) * 50;

        faceColorArray[i] = 0;
        if (i < COUNT) sizeArray[i] = 1.5;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

    particles = new THREE.Points(geometry, shaderMaterial);
    scene.add(particles);

    updateShape(SHAPES[shapeIdx]);

    // --- LOAD SECRET MODEL IN BACKGROUND ---
    if (MODEL_CONFIG['Secret']) {
        loadSecretModel();
    }
}

// --- SPECIAL LOADER FOR SECRET MODEL ---
// Loads directly into secretTargetArray
function loadSecretModel() {
    const config = MODEL_CONFIG['Secret'];
    loader.load(config.url, (gltf) => {
        let mesh = null;
        gltf.scene.traverse((child) => { if (child.isMesh && !mesh) mesh = child; });

        if (!mesh) {
            console.error("No mesh found in Secret GLB");
            return;
        }

        mesh.geometry.computeBoundingBox();
        mesh.geometry.center();

        if (config.rotation) {
            if (config.rotation.x) mesh.geometry.rotateX(config.rotation.x);
            if (config.rotation.y) mesh.geometry.rotateY(config.rotation.y);
            if (config.rotation.z) mesh.geometry.rotateZ(config.rotation.z);
        }

        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        let userScale = config.scale || 1.0;
        const scaleFactor = (60 / maxDim) * userScale;

        const sampler = new THREE.MeshSurfaceSampler(mesh)
            .setWeightAttribute(null)
            .build();

        const tempPosition = new THREE.Vector3();

        // Write directly to secretTargetArray
        for (let i = 0; i < COUNT; i++) {
            sampler.sample(tempPosition);
            tempPosition.multiplyScalar(scaleFactor);

            secretTargetArray[i * 3] = tempPosition.x;
            secretTargetArray[i * 3 + 1] = tempPosition.y;
            secretTargetArray[i * 3 + 2] = tempPosition.z;
        }
        console.log("Secret Model Loaded Successfully");

    }, undefined, (error) => {
        console.error("Error loading Secret model:", error);
    });
}

// --- STANDARD MODEL LOADER ---
function loadModelToParticles(name, modelConfig, isPreload = false) {
    if (!isPreload) {
        document.getElementById('shape-name').innerText = "LOADING MODEL...";
    }

    const url = modelConfig.url;

    loader.load(url, (gltf) => {
        let mesh = null;
        gltf.scene.traverse((child) => { if (child.isMesh && !mesh) mesh = child; });

        if (!mesh) {
            console.error("No mesh found in GLB: " + name);
            if (!isPreload) document.getElementById('shape-name').innerText = "MESH ERROR";
            return;
        }

        mesh.geometry.computeBoundingBox();
        mesh.geometry.center();

        if (modelConfig.rotation) {
            if (modelConfig.rotation.x) mesh.geometry.rotateX(modelConfig.rotation.x);
            if (modelConfig.rotation.y) mesh.geometry.rotateY(modelConfig.rotation.y);
            if (modelConfig.rotation.z) mesh.geometry.rotateZ(modelConfig.rotation.z);
        }

        mesh.geometry.computeBoundingBox();
        const box = mesh.geometry.boundingBox;
        const size = new THREE.Vector3();
        box.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z);

        let userScale = modelConfig.scale || 1.0;
        const scaleFactor = (60 / maxDim) * userScale;

        const sampler = new THREE.MeshSurfaceSampler(mesh)
            .setWeightAttribute(null)
            .build();

        const tempPosition = new THREE.Vector3();
        const newTargetArr = new Float32Array(COUNT * 3);

        for (let i = 0; i < COUNT; i++) {
            sampler.sample(tempPosition);
            tempPosition.multiplyScalar(scaleFactor);

            newTargetArr[i * 3] = tempPosition.x;
            newTargetArr[i * 3 + 1] = tempPosition.y;
            newTargetArr[i * 3 + 2] = tempPosition.z;
        }

        modelDataCache[name] = newTargetArr;

        if (!isPreload || SHAPES[shapeIdx] === name) {
            applyModelTarget(newTargetArr);
            if (SHAPES[shapeIdx] === name) {
                document.getElementById('shape-name').innerText = name.toUpperCase();
            }
        } else {
            console.log(`[Background] Preloaded ${name}`);
        }

    }, undefined, (error) => {
        console.error(`Error loading model ${name}:`, error);
        if (!isPreload) document.getElementById('shape-name').innerText = "LOAD ERROR";
    });
}

function applyModelTarget(dataArray) {
    for (let i = 0; i < COUNT * 3; i++) {
        targetArray[i] = dataArray[i];
    }
}

// --- BACKGROUND PRELOADER ---
function preloadAllModels() {
    console.log("Starting Background Preload Sequence...");
    const keys = Object.keys(MODEL_CONFIG);

    // Stagger downloads by 2 seconds each
    keys.forEach((name, index) => {
        // Skip Secret, handled separately
        if (name === 'Secret') return;

        setTimeout(() => {
            if (!modelDataCache[name]) {
                loadModelToParticles(name, MODEL_CONFIG[name], true);
            }
        }, 2000 * (index + 1));
    });
}

// --- SHAPE UPDATER ---
function updateShape(name) {
    if (!isSecretActive && !faceLocked && !isScanning && !isAudioMode) {
        document.getElementById('shape-name').innerText = name.toUpperCase();
    }

    // PATH A: Check if this is a GLB Model in MODEL_CONFIG
    if (MODEL_CONFIG[name]) {
        if (modelDataCache[name]) {
            applyModelTarget(modelDataCache[name]);
        } else {
            loadModelToParticles(name, MODEL_CONFIG[name], false);
        }
        return; 
    }

    // PATH B: Check for Platonic Solids
    let tempGeo = null;
    if (name === 'Tetrahedron') tempGeo = new THREE.TetrahedronGeometry(45, 0);
    else if (name === 'Octahedron') tempGeo = new THREE.OctahedronGeometry(40, 0);
    else if (name === 'Dodecahedron') tempGeo = new THREE.DodecahedronGeometry(35, 0);
    else if (name === 'Icosahedron') tempGeo = new THREE.IcosahedronGeometry(35, 0);

    if (tempGeo) {
        const mesh = new THREE.Mesh(tempGeo, new THREE.MeshBasicMaterial());
        const sampler = new THREE.MeshSurfaceSampler(mesh).build();
        const tempPos = new THREE.Vector3();
        for (let i = 0; i < COUNT; i++) {
            sampler.sample(tempPos);
            const i3 = i * 3;
            targetArray[i3] = tempPos.x;
            targetArray[i3+1] = tempPos.y;
            targetArray[i3+2] = tempPos.z;
        }
        tempGeo.dispose();
        return; 
    }

    // PATH C: Standard Math Shapes
    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3; 
        let x, y, z;
        
        if (name === 'Sphere') { 
            const r = 35; 
            const t = Math.random() * Math.PI * 2; 
            const p = Math.acos(2 * Math.random() - 1); 
            x = r * Math.sin(p) * Math.cos(t); 
            y = r * Math.sin(p) * Math.sin(t); 
            z = r * Math.cos(p); 
        }
        else if (name === 'Hyperboloid') {
            // One-sheeted hyperboloid (Cooling tower shape)
            const a = 20; const c = 20; // Waist radius
            const h = 80;
            const u = Math.random(); 
            y = (u - 0.5) * h;
            // Radius increases as we move away from y=0
            const r = a * Math.sqrt(1 + (y*y)/(c*c));
            const t = Math.random() * Math.PI * 2;
            x = r * Math.cos(t);
            z = r * Math.sin(t);
        }
        else if (name === 'Saddle Surface') {
            // Hyperbolic Paraboloid
            const range = 40;
            x = (Math.random() - 0.5) * 2 * range;
            z = (Math.random() - 0.5) * 2 * range;
            // y = x^2/a^2 - z^2/b^2
            y = (x * x) / 30 - (z * z) / 30;
        }
        else if (name === 'Lissajous Curve') {
            // 3D Knot
            const t = (i / COUNT) * Math.PI * 2 * 10; // 10 loops
            // A=30, B=30, C=30, a=3, b=2, c=4
            x = 35 * Math.sin(3 * t);
            y = 35 * Math.sin(2 * t);
            z = 35 * Math.sin(4 * t);
            // Add slight jitter for volume
            x += (Math.random() - 0.5) * 2;
            y += (Math.random() - 0.5) * 2;
            z += (Math.random() - 0.5) * 2;
        }
        else if (name === 'Spring') {
            // Tight Coil
            const h = 80;
            const r = 15;
            const turns = 15;
            const u = i / COUNT;
            y = (u - 0.5) * h;
            const t = u * Math.PI * 2 * turns;
            
            // Add thickness to the wire
            const wireR = 2;
            const wireAng = Math.random() * Math.PI * 2;
            
            // Main spiral position
            const cx = r * Math.cos(t);
            const cz = r * Math.sin(t);
            
            // Offset for thickness
            x = cx + wireR * Math.cos(wireAng);
            z = cz + wireR * Math.sin(wireAng);
        }
        else if (name === 'Cube') { 
            const s = 50; 
            x = (Math.random() - 0.5) * s; y = (Math.random() - 0.5) * s; z = (Math.random() - 0.5) * s; 
        }
        else if (name === 'Pyramid') { 
            const h = 50; const b = 45; 
            const yn = Math.random(); y = (yn - 0.5) * h; 
            const w = (1 - yn) * b; x = (Math.random() - 0.5) * w; z = (Math.random() - 0.5) * w; 
        }
        else if (name === 'Plane') { 
            x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 100; z = 0; 
        }
        else if (name === 'Ellipsoid') {
            const a = 30; const b = 50; const c = 20;
            const t = Math.random() * Math.PI * 2; const p = Math.acos(2 * Math.random() - 1);
            x = a * Math.sin(p) * Math.cos(t); y = b * Math.sin(p) * Math.sin(t); z = c * Math.cos(p);
        }
        else if (name === 'Torus') {
            // Major Radius (distance from center to tube)
            const R = 30; 
            // Minor Radius (thickness of the tube)
            const r = 12; 
            
            // t = Angle around the main ring
            const t = Math.random() * Math.PI * 2; 
            // p = Angle around the tube's cross-section
            const p = Math.random() * Math.PI * 2; 

            // Standard Torus Formula aligned to face the camera (X-Y plane)
            x = (R + r * Math.cos(p)) * Math.cos(t);
            y = (R + r * Math.cos(p)) * Math.sin(t);
            z = r * Math.sin(p);
        }
        else if (name === 'Cone') {
            const h = 60; const rBase = 30;
            const u = Math.random(); y = (u - 0.5) * h;
            const r = (1 - u) * rBase;
            const t = Math.random() * Math.PI * 2;
            x = r * Math.cos(t); z = r * Math.sin(t);
        }
        else if (name === 'Cylinder') {
            const h = 70; const r = 25;
            y = (Math.random() - 0.5) * h;
            const t = Math.random() * Math.PI * 2;
            x = r * Math.cos(t); z = r * Math.sin(t);
        }
        else if (name === 'Frustum') {
            const h = 60; const rBottom = 35; const rTop = 15;
            const u = Math.random(); y = (u - 0.5) * h;
            const r = rBottom + (rTop - rBottom) * u;
            const t = Math.random() * Math.PI * 2;
            x = r * Math.cos(t); z = r * Math.sin(t);
        }
        else if (name === 'Wave') {
            const range = 100;
            x = (Math.random() - 0.5) * range; z = (Math.random() - 0.5) * range;
            y = Math.sin(x * 0.1) * 10 + Math.cos(z * 0.1) * 10;
        }
        else if (name === 'Spiral') {
            const turns = 4;
            const t = (i / COUNT) * Math.PI * 2 * turns;
            const r = (i / COUNT) * 60; 
            x = r * Math.cos(t); y = r * Math.sin(t);
            z = (Math.random() - 0.5) * 5;
        }
        else if (name === 'Helix') {
            const h = 100; const r = 25; const turns = 5;
            const u = i / COUNT; y = (u - 0.5) * h;
            const t = u * Math.PI * 2 * turns;
            x = r * Math.cos(t); z = r * Math.sin(t);
        }
        else if (name === 'Arrow') {
            const split = Math.floor(COUNT * 0.7);
            if (i < split) {
                const length = 50; const width = 10;
                x = (Math.random() - 0.5) * length - 10; y = (Math.random() - 0.5) * width; z = (Math.random() - 0.5) * width;
            } else {
                const h = 25; const rBase = 15;
                const u = Math.random(); x = u * h + 15;
                const r = (1 - u) * rBase; const t = Math.random() * Math.PI * 2;
                y = r * Math.cos(t); z = r * Math.sin(t);
            }
        }
        else if (name === 'Infinity Symbol') {
            const scale = 50;
            const t = (i / COUNT) * Math.PI * 2;
            const dom = 1 + Math.pow(Math.sin(t), 2);
            x = scale * (Math.cos(t) / dom); y = scale * (Math.sin(t) * Math.cos(t) / dom);
            z = (Math.random() - 0.5) * 5;
        }
        else if (name === 'Heart') { 
            const t = Math.random() * Math.PI * 2; 
            x = 16 * Math.pow(Math.sin(t), 3); y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); 
            z = (Math.random() - 0.5) * 15; x *= 1.5; y *= 1.5; z *= 1.5; 
        }
        else if (name === 'Galaxy') { 
            const a = 4; const s = i % a; 
            const r = Math.random() * 50; const ang = (s / a) * Math.PI * 2 + (r * 0.1); 
            x = Math.cos(ang) * r + (Math.random() - 0.5) * 5; z = Math.sin(ang) * r + (Math.random() - 0.5) * 5; 
            y = (Math.random() - 0.5) * (10 - r * 0.15); 
        }
        else if (name === 'Saturn') { 
            if (Math.random() < 0.3) { 
                const r = 20; const t = Math.random() * Math.PI * 2; const p = Math.acos(2 * Math.random() - 1); 
                x = r * Math.sin(p) * Math.cos(t); y = r * Math.sin(p) * Math.sin(t); z = r * Math.cos(p); 
            } else { 
                const a = Math.random() * Math.PI * 2; const d = 30 + Math.random() * 20; 
                x = Math.cos(a) * d; z = Math.sin(a) * d; y = (Math.random() - 0.5); 
            } 
            const tx = x; x = tx * Math.cos(0.5) - y * Math.sin(0.5); y = tx * Math.sin(0.5) + y * Math.cos(0.5); 
        }
        else {
            // Default Fallback
            x = (Math.random() - 0.5) * 100;
            y = (Math.random() - 0.5) * 100;
            z = (Math.random() - 0.5) * 100;
        }

        targetArray[i3] = x; targetArray[i3 + 1] = y; targetArray[i3 + 2] = z;
    }
}

