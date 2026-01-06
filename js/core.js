// --- START OF FILE core.js ---

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

// --- UPDATED DROP LISTENER WITH ERROR FEEDBACK ---
canvas.addEventListener('drop', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        const file = files[0];
        
        if (file.type.startsWith('audio/')) {
            // Success: Hide overlay immediately and load
            dragDropOverlay.classList.remove('active');
            startAudioFile(file);
        } else {
            // Error: Show feedback on the overlay
            const txt = document.getElementById('drag-drop-text');
            
            // Visual Error State (Red)
            txt.innerText = ":: FILE NOT SUPPORTED ::";
            txt.style.color = "#ff3333";
            txt.style.borderColor = "#ff3333";
            txt.style.boxShadow = "0 0 50px rgba(255, 51, 51, 0.4)";
            
            // Pulse the border red
            dragDropOverlay.style.outlineColor = "#ff3333";

            // Keep overlay visible for 1.5s then reset
            setTimeout(() => {
                dragDropOverlay.classList.remove('active');
                
                // Reset text/styles after the fade-out transition (300ms)
                setTimeout(() => {
                    txt.innerText = ":: DROP AUDIO DATA ::";
                    txt.style.color = "";      // Revert to CSS default
                    txt.style.borderColor = ""; // Revert to CSS default
                    txt.style.boxShadow = "";   // Revert to CSS default
                    dragDropOverlay.style.outlineColor = "";
                }, 300);
            }, 1500);
        }
    } else {
        dragDropOverlay.classList.remove('active');
    }
});

const renderScene = new THREE.RenderPass(scene, camera);

// --- POST PROCESSING (Bloom + Afterimage) ---
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
        posArray[i] = (Math.random() - 0.5) * 200;
        colArray[i] = 1.0;
        targetArray[i] = posArray[i];
        faceColorArray[i] = 0;
        if (i < COUNT) sizeArray[i] = 1.5;
    }

    let pIdx = 0;
    const addPart = (arr, count, genFunction) => {
        for (let i = 0; i < count; i++) {
            if (pIdx >= COUNT) break;
            const xyz = genFunction();
            const i3 = pIdx * 3;
            arr[i3] = xyz.x; arr[i3 + 1] = xyz.y; arr[i3 + 2] = xyz.z;
            pIdx++;
        }
    };

    // Secret "Loser" shape generation logic
    pIdx = 0;
    addPart(secretTargetArray, COUNT * 0.30, () => ({ x: (Math.random() - 0.5) * 43, y: (Math.random() - 0.5) * 40 - 20, z: (Math.random() - 0.5) * 15 }));
    addPart(secretTargetArray, COUNT * 0.25, () => { const h = 55; const r = 7.5; const a = Math.random() * Math.PI * 2; const rad = Math.sqrt(Math.random()) * r; return { x: Math.cos(a) * rad - 5.5, y: Math.random() * h, z: Math.sin(a) * rad }; });
    [{ x: -17, y: 6 }, { x: 6.5, y: 6 }, { x: 16, y: 3 }].forEach(k => {
        addPart(secretTargetArray, COUNT * 0.10, () => { const t = Math.random(); const c = t * Math.PI; let cx = k.x + (Math.random() - 0.5) * 8; let cy = k.y; let cz = 0; cy -= Math.sin(c / 2) * 35; cz = -(1 - Math.cos(c)) * 10; return { x: cx, y: cy + (Math.random() - 0.5) * 5, z: cz + (Math.random() - 0.5) * 5 + 5 }; });
    });
    addPart(secretTargetArray, COUNT * 0.15, () => ({ x: -27 + (Math.random() - 0.5) * 10, y: -30 + (Math.random() - 0.5) * 15, z: 5 + (Math.random() - 0.5) * 8 }));
    while (pIdx < COUNT) { const i3 = pIdx * 3; secretTargetArray[i3] = (Math.random() - 0.5) * 20; secretTargetArray[i3 + 1] = (Math.random() - 0.5) * 20; secretTargetArray[i3 + 2] = (Math.random() - 0.5) * 20; pIdx++; }

    geometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colArray, 3));
    geometry.setAttribute('size', new THREE.BufferAttribute(sizeArray, 1));

    particles = new THREE.Points(geometry, shaderMaterial);
    scene.add(particles);

    updateShape(SHAPES[shapeIdx]);
}

function updateShape(name) {
    if (!isSecretActive && !faceLocked && !isScanning && !isAudioMode) document.getElementById('shape-name').innerText = name.toUpperCase();
    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3; let x, y, z;
        if (name === 'Sphere') { const r = 35; const t = Math.random() * Math.PI * 2; const p = Math.acos(2 * Math.random() - 1); x = r * Math.sin(p) * Math.cos(t); y = r * Math.sin(p) * Math.sin(t); z = r * Math.cos(p); }
        else if (name === 'Heart') { const t = Math.random() * Math.PI * 2; x = 16 * Math.pow(Math.sin(t), 3); y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t); z = (Math.random() - 0.5) * 15; x *= 1.5; y *= 1.5; z *= 1.5; }
        else if (name === 'Plane') { x = (Math.random() - 0.5) * 150; y = (Math.random() - 0.5) * 100; z = 0; }
        else if (name === 'Cube') { const s = 50; x = (Math.random() - 0.5) * s; y = (Math.random() - 0.5) * s; z = (Math.random() - 0.5) * s; z = (Math.random() - 0.5) * s; }
        else if (name === 'Pyramid') { const h = 50; const b = 45; const yn = Math.random(); y = (yn - 0.5) * h; const w = (1 - yn) * b; x = (Math.random() - 0.5) * w; z = (Math.random() - 0.5) * w; }
        else if (name === 'Galaxy') { const a = 4; const s = i % a; const r = Math.random() * 50; const ang = (s / a) * Math.PI * 2 + (r * 0.1); x = Math.cos(ang) * r + (Math.random() - 0.5) * 5; z = Math.sin(ang) * r + (Math.random() - 0.5) * 5; y = (Math.random() - 0.5) * (10 - r * 0.15); }
        else if (name === 'Saturn') { if (Math.random() < 0.3) { const r = 20; const t = Math.random() * Math.PI * 2; const p = Math.acos(2 * Math.random() - 1); x = r * Math.sin(p) * Math.cos(t); y = r * Math.sin(p) * Math.sin(t); z = r * Math.cos(p); } else { const a = Math.random() * Math.PI * 2; const d = 30 + Math.random() * 20; x = Math.cos(a) * d; z = Math.sin(a) * d; y = (Math.random() - 0.5); } const tx = x; x = tx * Math.cos(0.5) - y * Math.sin(0.5); y = tx * Math.sin(0.5) + y * Math.cos(0.5); }
        else if (name === 'Human') { const r = Math.random(); if (r < 0.1) { const rd = 6; const t = Math.random() * Math.PI * 2; const p = Math.acos(2 * Math.random() - 1); x = rd * Math.sin(p) * Math.cos(t); y = rd * Math.sin(p) * Math.sin(t) + 25; z = rd * Math.cos(p); } else if (r < 0.45) { x = (Math.random() - 0.5) * 14; y = (Math.random() - 0.5) * 28; z = (Math.random() - 0.5) * 8; } else if (r < 0.6) { x = -12 + (Math.random() - 0.5) * 4; y = 5 + (Math.random() - 0.5) * 22; z = (Math.random() - 0.5) * 4; } else if (r < 0.75) { x = 12 + (Math.random() - 0.5) * 4; y = 5 + (Math.random() - 0.5) * 22; z = (Math.random() - 0.5) * 4; } else if (r < 0.875) { x = -5 + (Math.random() - 0.5) * 5; y = -24 + (Math.random() - 0.5) * 24; z = (Math.random() - 0.5) * 5; } else { x = 5 + (Math.random() - 0.5) * 5; y = -24 + (Math.random() - 0.5) * 24; z = (Math.random() - 0.5) * 5; } }
        targetArray[i3] = x; targetArray[i3 + 1] = y; targetArray[i3 + 2] = z;
    }
}