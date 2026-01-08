// --- START OF FILE app.js ---

// --- INITIALIZATION ---
function launchSystem(selectedCount) {
    document.removeEventListener('keydown', handlePerfKey);
    config.particleCount = selectedCount;

    // Set model complexity based on particle count to balance load
    if (selectedCount <= 12000) {
        config.modelComplexity = 0;
        console.log("Performance: Optimization Enabled (Lite Model)");
    } else {
        config.modelComplexity = 1;
        console.log("Performance: Standard Mode (Full Model)");
    }

    // Dynamic Blur Strength adjustment based on Performance Tier
    // Lower particle counts get stronger trails to fill the gaps
    let newBlurStr = 0.75;
    if (selectedCount <= 6000) {
        newBlurStr = 0.75; // Low [6K]
    } else if (selectedCount <= 12000) {
        newBlurStr = 0.65; // Medium [12K]
    } else if (selectedCount <= 20000) {
        newBlurStr = 0.45; // High [20K]
    } else {
        newBlurStr = 0.2;  // Ultra [32K]
    }

    config.blurStrength = newBlurStr;

    // Sync UI to new values
    const blurSlider = document.getElementById('i-blurStr');
    if (blurSlider) blurSlider.value = newBlurStr;
    const blurVal = document.getElementById('v-blurStr');
    if (blurVal) blurVal.innerText = newBlurStr;

    if (typeof hands !== 'undefined') {
        hands.setOptions({
            maxNumHands: 2,
            modelComplexity: config.modelComplexity,
            minDetectionConfidence: 0.6,
            minTrackingConfidence: 0.6
        });
    }

    // Update Custom Dropdown (if exists)
    const perfSelected = document.getElementById('perf-selected');
    if (perfSelected) {
        let label = "HIGH (20,000) - Recommended";
        if (selectedCount >= 32000) label = "ULTRA (32,000)";
        else if (selectedCount <= 6000) label = "LOW (6,000)";
        else if (selectedCount <= 12000) label = "MEDIUM (12,000)";
        perfSelected.innerText = label;
    }

    // --- ANIMATED TRANSITION ---
    const options = document.querySelectorAll('.perf-option');

    // Find clicked option and add confirmation pulse
    options.forEach(opt => {
        if (opt.innerText.includes(selectedCount.toString().replace('000', 'K'))) {
            opt.classList.add('selected-confirm');
        }
    });

    // Staggered Exit after a short delay for confirmation
    setTimeout(() => {
        options.forEach((opt, index) => {
            setTimeout(() => {
                opt.classList.add('exit');
            }, index * 80);
        });

        // After all exits complete, show loader
        const totalExitTime = (options.length * 80) + 400; // stagger + animation duration
        setTimeout(() => {
            document.getElementById('perf-selector').style.display = 'none';
            const loader = document.getElementById('loading-container');
            loader.style.display = 'flex';
            // Trigger reflow for transition
            void loader.offsetWidth;
            loader.classList.add('visible');
            initializeSystem();
        }, totalExitTime);
    }, 350); // Wait for confirmation pulse
}

function initializeSystem() {
    document.querySelector('.l-navbar').style.transition = 'opacity 1.5s ease';
    document.querySelector('.l-navbar').style.opacity = '0';
    setTimeout(() => { document.querySelector('.l-navbar').style.display = 'none'; }, 1500);

    const fill = document.getElementById('progress-fill');
    const txt = document.getElementById('loading-text');
    const messages = [
        "INITIALIZING KERNEL...", "LOADING SHADERS...", "ALLOCATING VRAM...",
        "CALIBRATING OPTICS...", "ESTABLISHING NEURAL LINK...", "RENDERING PARTICLES..."
    ];

    let progress = 0;
    let msgIdx = 0;

    // Simulated Loading Sequence
    const fakeLoader = setInterval(() => {
        progress += Math.random() * 2;
        if (progress > 90) progress = 90;
        fill.style.width = progress + "%";
        if (Math.random() > 0.8) {
            msgIdx = (msgIdx + 1) % messages.length;
            txt.innerText = messages[msgIdx];
        }
    }, 100);

    navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: true })
        .then(stream => {
            globalStream = stream;
            const video = document.getElementById('input-video');
            video.srcObject = stream;
            video.onloadedmetadata = () => {
                video.play();
                isDetectionRunning = true;
                initParticles(config.particleCount);
                runDetection();
            };

            clearInterval(fakeLoader);
            fill.style.width = "100%";
            txt.innerText = "ACCESS GRANTED";
            txt.style.color = "#fff";

            // Fade out landing page, fade in UI
            setTimeout(() => {
                document.getElementById('landing-page').style.opacity = '0';
                setTimeout(() => { document.getElementById('landing-page').style.display = 'none'; }, 1500);
                setTimeout(() => {
                    document.getElementById('ui-layer').classList.add('active');
                    document.getElementById('settings-trigger').style.display = 'flex';
                }, 1500);
            }, 800);
        })
        .catch(err => {
            console.error("Initialization Error:", err);
            clearInterval(fakeLoader);
            txt.innerText = "PERMISSION DENIED";
            txt.style.color = "red";
            document.querySelector('.l-note').innerText = "Refresh the page and allow camera & microphone access to continue.";
            document.querySelector('.l-note').style.color = "red";
        });
}

// --- MAIN ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    if (!particles) return;

    const dt = clock.getDelta();
    const time = clock.getElapsedTime();
    frameCount++;

    // Low Light Detection (Checks avg brightness of video feed center)
    if (frameCount % 60 === 0) {
        try {
            const frame = colorCtx.getImageData(110, 70, 100, 100).data;
            let totalBrightness = 0;
            let countSamples = 0;
            for (let i = 0; i < frame.length; i += 40) {
                totalBrightness += (frame[i] * 0.299 + frame[i + 1] * 0.587 + frame[i + 2] * 0.114);
                countSamples++;
            }
            const avg = totalBrightness / countSamples;
            const warnEl = document.getElementById('low-light-warning');
            if (avg < 40) warnEl.style.display = 'block';
            else warnEl.style.display = 'none';
        } catch (e) { }
    }

    // --- IDLE ROTATION LOGIC ---
    if (hand.gesture !== 'THREE' && !isSecretActive && !isZooming && !isFaceMode && !isScanning && !isAudioMode) {
        particles.rotation.y -= config.rotSpeed;
    }
    if (isFaceMode || isScanning || isSecretActive) {
        // Dampen rotation to 0 when in a locked mode
        particles.rotation.y += (0 - particles.rotation.y) * 0.1;
    }

    if (cooldown > 0) cooldown -= dt;
    if (audioToggleCooldown > 0) audioToggleCooldown -= dt;

    // --- BUFFER TIMERS LOGIC ---

    // 1. PINCH BUFFER
    if (hand.gesture === 'PINCH') {
        pinchBufferTimer += dt;
    } else {
        pinchBufferTimer = 0;
    }

    // 2. PEACE BUFFER
    if (hand.gesture === 'PEACE') {
        peaceTimer += dt;
    } else {
        peaceTimer = 0;
    }

    // 3. SECRET BUFFER (NEW)
    if (hand.gesture === 'SECRET') {
        secretBufferTimer += dt;
    } else {
        secretBufferTimer = 0;
    }

    // Define 'isPinch' based on the buffer
    let isPinch = (hand.gesture === 'PINCH' && pinchBufferTimer > config.pinchBuffer);

    let isRock = (hand.gesture === 'ROCK');
    let isThree = (hand.gesture === 'THREE');
    let isShhh = (hand.gesture === 'SHHH');

    // Supernova Charge Logic
    if (isPinch) { lastPinchTime = time; }
    const inGracePeriod = (time - lastPinchTime < 0.5);

    if ((isPinch || inGracePeriod) && !isSupernova && !isStealthMode && !faceLocked && !isScanning && !isAudioMode) {
        pinchTimer += dt;
        if (pinchTimer > config.supernovaCharge) {
            if (!isSupernova) {
                isSupernova = true;
                document.getElementById('shape-name').innerText = "SUPERNOVA";
            }
        } else {
            document.getElementById('shape-name').innerText = "CHARGING... " + Math.floor(config.supernovaCharge - pinchTimer);
        }
    } else {
        if (!isSupernova) pinchTimer = 0;
    }

    // --- CONTINUOUS SUPERNOVA VIBRATION ---
    if (isSupernova && config.supernovaVibration) {
        supernovaVibeTimer -= dt;
        if (supernovaVibeTimer <= 0) {
            // Pulse vibration every 0.1 seconds
            if (navigator.vibrate) navigator.vibrate(100);
            supernovaVibeTimer = 0.1;
        }
    } else {
        // Reset vibration timer when mode is inactive
        supernovaVibeTimer = 0;
    }

    // Audio Toggle Logic
    if (hand.gesture === 'AUDIO_TRIG' && audioToggleCooldown <= 0 && !faceLocked && !isScanning && !isSupernova && !isStealthMode) {
        if (!isAudioMode) { startAudio(); } else { stopAudio(); }
        audioToggleCooldown = 2.0;
    }

    // Play/Pause (File Mode Only)
    if (isAudioFileMode && hand.gesture === 'THREE' && audioToggleCooldown <= 0 && !isSupernova) {
        isPaused = !isPaused;
        if (audioElement) {
            if (isPaused) audioElement.pause();
            else audioElement.play();
        }
        audioToggleCooldown = 0.5;
    }

    // Next Shape Logic (WITH BUFFER)
    if (hand.gesture === 'PEACE' && peaceTimer > config.peaceBuffer && cooldown <= 0) {
        if (faceLocked || isScanning) { faceLocked = false; isScanning = false; isFaceMode = false; }
        if (isAudioMode) stopAudio();
        if (isSupernova) { isSupernova = false; pinchTimer = 0; }
        shapeIdx = (shapeIdx + 1) % SHAPES.length;
        updateShape(SHAPES[shapeIdx]);

        cooldown = 2.0;
        peaceTimer = 0;
    }

    // Global Exit Logic (FIST)
    if ((faceLocked || isScanning || isAudioMode || isSupernova || isStealthMode) && hand.gesture === 'FIST') {
        faceLocked = false; isScanning = false; isFaceMode = false; isSupernova = false; isStealthMode = false; pinchTimer = 0;
        if (isAudioMode) stopAudio();
        document.getElementById('shape-name').innerText = SHAPES[shapeIdx].toUpperCase();
    }

    // Camera Transition Smoother
    if (isAudioMode) { audioTransition += dt * 0.8; } else { audioTransition -= dt * 0.8; }
    audioTransition = Math.max(0, Math.min(1, audioTransition));

    // Stealth Mode Logic
    if (isShhh && !faceLocked && !isScanning && !isAudioMode && !isSupernova) {
        isStealthMode = true;
    }
    if (isStealthMode) {
        stealthFactor += dt * 0.8;
        if (stealthFactor > 0.5) document.getElementById('shape-name').innerText = "SILENT";
    } else {
        stealthFactor -= dt * 2.0;
        if (!faceLocked && !isScanning && !isSecretActive && !isAudioMode && !isSupernova && stealthFactor < 0.1) document.getElementById('shape-name').innerText = SHAPES[shapeIdx].toUpperCase();
    }
    stealthFactor = Math.max(0, Math.min(1, stealthFactor));

    // Easter Egg Logic (WITH BUFFER)
    if (hand.gesture === 'SECRET' && secretBufferTimer > config.secretBuffer && !faceLocked && !isScanning && !isAudioMode && !isSupernova && !isStealthMode) {
        isSecretActive = true;
        secretTimer = 1.35;
        document.getElementById('shape-name').innerText = "F**k You";
    }

    if (isSecretActive) {
        if (hand.gesture !== 'SECRET') secretTimer -= dt;
        if (secretTimer <= 0) { isSecretActive = false; document.getElementById('shape-name').innerText = SHAPES[shapeIdx].toUpperCase(); }
    }

    // Face Scan Logic
    if (hand.gesture === 'THUMB' && !faceLocked && !isScanning && !isAudioMode && !isSupernova && !isStealthMode) {
        isScanning = true; scanTimer = 0; document.getElementById('shape-name').innerText = "SCANNING...";
    }
    if (isScanning) {
        scanTimer += dt;
        camTheta += (0 - camTheta) * 0.1;
        camPhi += ((Math.PI / 2) - camPhi) * 0.1;
        camRadius += (90 - camRadius) * 0.1;
        if (scanTimer > 1.5) { isScanning = false; faceLocked = true; isFaceMode = true; document.getElementById('shape-name').innerText = "IDENTITY CONFIRMED"; }
    }

    // --- CAMERA ORBITAL CONTROLS & RESET LOGIC ---

    // 1. Trigger the Reset Flag if Fist is detected
    if (hand.gesture === 'FIST') {
        isResetting = true;
    }

    // 2. Interrupt the Reset
    if (isZooming || (hand.present && hand.gesture === 'OPEN') || isFaceMode || isScanning || isAudioMode || isSecretActive || isSupernova) {
        isResetting = false;
    }

    // 3. Manual Camera Interaction (Only if not resetting)
    if (!isZooming && !faceLocked && !isScanning && !isResetting) {
        if (hand.present && hand.gesture === 'OPEN') {
            if (!wasDragging) { lastHandX = hand.x; lastHandY = hand.y; wasDragging = true; }
            else {
                const dx = hand.x - lastHandX; const dy = hand.y - lastHandY;
                camTheta -= dx * config.openSens;
                if (!isAudioMode) { camPhi += dy * config.openSens; camPhi = Math.max(0.1, Math.min(Math.PI - 0.1, camPhi)); }
                lastHandX = hand.x; lastHandY = hand.y;
            }
        } else { wasDragging = false; }
    }

    // 4. Apply Persistent Reset Interpolation
    if (isResetting) {
        wasDragging = false;
        camTheta += (0 - camTheta) * 0.05;
        camPhi += ((Math.PI / 2) - camPhi) * 0.05;
        camRadius += (90 - camRadius) * 0.05;

        if (Math.abs(camTheta) < 0.005 && Math.abs(camPhi - Math.PI / 2) < 0.005 && Math.abs(camRadius - 90) < 0.5) {
            isResetting = false;
        }
    }

    // Camera Rotation in Audio Mode
    if (isAudioMode && !wasDragging && hand.gesture !== 'OPEN' && !isPaused) {
        visRotation += dt * config.audioRotSpeed;
    }

    // Force reset values if in a locked mode
    if (isSecretActive || faceLocked) {
        camTheta += (0 - camTheta) * 0.05;
        camPhi += ((Math.PI / 2) - camPhi) * 0.05;
        camRadius += (90 - camRadius) * 0.05;
    }

    // Apply Post-Processing uniforms
    if (afterimagePass) {
        if (isFaceMode || isScanning || isAudioMode) {
            afterimagePass.uniforms['damp'].value = 0.0;
        } else {
            afterimagePass.uniforms['damp'].value = config.motionBlur ? config.blurStrength : 0.0;
        }
    }

    // Calculate Camera Position
    const orbitX = camRadius * Math.sin(camPhi) * Math.sin(camTheta);
    const orbitZ = camRadius * Math.sin(camPhi) * Math.cos(camTheta);
    const orbitY = camRadius * Math.cos(camPhi);
    const standardPos = new THREE.Vector3(orbitX, orbitY, orbitZ);
    const centerPos = new THREE.Vector3(0, -15, 0);
    // Interpolate camera for Audio Mode transition
    const finalPos = new THREE.Vector3().lerpVectors(standardPos, centerPos, audioTransition);
    camera.position.copy(finalPos);

    const standardLook = new THREE.Vector3(0, 0, 0);
    const audioDir = new THREE.Vector3(Math.sin(camTheta) * 100, 0, Math.cos(camTheta) * 100);
    const audioLook = new THREE.Vector3().addVectors(centerPos, audioDir);
    const finalLook = new THREE.Vector3().lerpVectors(standardLook, audioLook, audioTransition);
    camera.lookAt(finalLook);

    // --- COLOR & PARTICLE UPDATE LOOP ---
    let baseR = config.idleColorRGB.r;
    let baseG = config.idleColorRGB.g;
    let baseB = config.idleColorRGB.b;

    if (hand.gesture === 'FIST') { baseR = 0.8; baseG = 0.8; baseB = 0.8; }
    else if (isPinch) { baseR = 1; baseG = 0; baseB = 0.3; }
    else if (isRock) { baseR = 1; baseG = 0.6; baseB = 0; }
    else if (isSecretActive) { baseR = 1; baseG = 0; baseB = 0; }
    else if (isZooming) { baseR = 1; baseG = 1; baseB = 0; }
    else if (isScanning) { baseR = 0; baseG = 1; baseB = 0; }

    if (isSupernova) { baseR = 1; baseG = 1; baseB = 0.2; }
    else if (pinchTimer > 0 && (isPinch || inGracePeriod)) { baseR = 1; baseG = 0; baseB = 0; }

    let stealthRMod = 1, stealthGMod = 1, stealthBMod = 1;
    let stealthPulseOffsetR = 0, stealthPulseOffsetG = 0, stealthPulseOffsetB = 0;

    // Pulse math for Stealth Mode
    if (stealthFactor > 0.01) {
        const sine = (Math.sin(time * config.stealthSpeed) + 1) / 2;
        const pulse = config.stealthMin + sine * (config.stealthMax - config.stealthMin);

        stealthRMod = 1 - stealthFactor;
        stealthGMod = 1 - stealthFactor;
        stealthBMod = 1 - stealthFactor;

        stealthPulseOffsetR = (config.idleColorRGB.r * pulse) * stealthFactor;
        stealthPulseOffsetG = (config.idleColorRGB.g * pulse) * stealthFactor;
        stealthPulseOffsetB = (config.idleColorRGB.b * pulse) * stealthFactor;
    }

    let globalSpeed = 0.05;
    let activeTargetArr = targetArray;

    if (isSecretActive) {
        activeTargetArr = secretTargetArray;
        globalSpeed = 0.1;
    }
    else if (isFaceMode && faceLandmarks) {
        activeTargetArr = faceTargetArray;
        globalSpeed = 0.1;
    }
    else if (isScanning) {
        globalSpeed = faceLandmarks ? 0.05 : 0.1;
    }
    else if (hand.present && !faceLocked && !isScanning && !isAudioMode) {
        if (isPinch || inGracePeriod) globalSpeed = 0.08;
        else if (isRock) globalSpeed = config.rockSpeed;
    }

    if (isAudioMode) {
        globalSpeed = 0.25;
        if (analyser && !isPaused) analyser.getByteFrequencyData(dataArray);
    }
    if (isSupernova) globalSpeed = 0.1;
    if (pinchTimer > 0 && (isPinch || inGracePeriod) && !isSupernova) globalSpeed = 0.1;

    let rotCo = 1, rotSi = 0;
    let applyRotation = false;

    // Calculate global rotation matrix if needed
    if (!isThree && !isShhh && !isStealthMode && !isSecretActive && !isZooming && !isFaceMode && !isScanning && !isAudioMode) {
        const rot = time * 0.1;
        rotCo = Math.cos(rot); rotSi = Math.sin(rot);
        applyRotation = true;
    }

    const p = geometry.attributes.position.array;
    const c = geometry.attributes.color.array;

    // Dynamic Bar Mapping
    const numBars = config.audioBarCount;
    const particlesPerBar = Math.floor(COUNT / numBars);

    for (let i = 0; i < COUNT; i++) {
        const i3 = i * 3;
        let px = p[i3]; let py = p[i3 + 1]; let pz = p[i3 + 2];
        let tx, ty, tz;
        let r = baseR, g = baseG, b = baseB;

        // --- AUDIO VISUALIZER MATH ---
        if (isAudioMode && dataArray) {
            let barIdx = Math.floor(i / particlesPerBar);
            if (barIdx >= numBars) barIdx = numBars - 1;
            const stackIdx = i % particlesPerBar;

            // Limit frequency range to avoid empty high-end bars
            const freqLimit = isAudioFileMode ? 0.65 : 0.85;
            const freq = dataArray[Math.floor((barIdx / numBars) * (dataArray.length * freqLimit))];

            const angle = (barIdx / numBars) * Math.PI * 2 + visRotation;
            const rad = 45;

            let effectiveSensitivity = config.audioSensitivity;
            if (isPaused) effectiveSensitivity = 0;

            const h = (freq / 255) * effectiveSensitivity;
            const myH = (stackIdx / particlesPerBar) * 90;

            if (myH < h) { tx = Math.cos(angle) * rad; tz = Math.sin(angle) * rad; ty = myH - 15; }
            else { tx = Math.cos(angle) * rad; tz = Math.sin(angle) * rad; ty = -30; }

            // Gradient coloring based on frequency height
            const ratio = barIdx / numBars;
            if (ratio < 0.4) { r = 1.0 - ratio; g = 0; b = ratio * 2.5; }
            else {
                const subRatio = (ratio - 0.4) / 0.6;
                r = 0; g = 1.0 - subRatio; b = subRatio;
            }

        } else if (isScanning && !faceLandmarks) {
            // Scanning Orbit Effect
            const ang = time * 2 + i * 0.1; const rad = 20 + i % 30;
            tx = Math.cos(ang) * rad; ty = Math.sin(ang) * rad; tz = 0;
        }
        else {
            tx = activeTargetArr[i3]; ty = activeTargetArr[i3 + 1]; tz = activeTargetArr[i3 + 2];
        }

        if (applyRotation) {
            const rx = tx * rotCo - tz * rotSi; const rz = tx * rotSi + tz * rotCo;
            tx = rx; tz = rz;
        }

        // --- GESTURE PHYSICS ---
        if (!isFaceMode && !isScanning && !isAudioMode && hand.present) {
            if ((isPinch || inGracePeriod) && !isSupernova) {
                tx = 0; ty = 0; tz = 0;
            }
            else if (isRock) {
                // Explosion scatter
                tx = px * 1.35 + (Math.random() - 0.5) * 5;
                ty = py * 1.35 + (Math.random() - 0.5) * 5;
                tz = pz * 1.35 + (Math.random() - 0.5) * 5;
            }
            else if (isThree) {
                // Freeze in place
                tx = px; ty = py; tz = pz;
            }
        }

        if (isScanning && faceLandmarks) {
            // Jitter effect during scan
            tx += (Math.random() - 0.5) * 50; ty += (Math.random() - 0.5) * 50; tz += (Math.random() - 0.5) * 50;
        }

        if (isSupernova) {
            // Apply massive force multiplication
            tx = activeTargetArr[i3] * config.supernovaForce + (Math.random() - 0.5) * 50;
            ty = activeTargetArr[i3 + 1] * config.supernovaForce + (Math.random() - 0.5) * 50;
            tz = activeTargetArr[i3 + 2] * config.supernovaForce + (Math.random() - 0.5) * 50;
        } else if (pinchTimer > 0 && (isPinch || inGracePeriod)) {
            // Implosion jitter
            tx = (Math.random() - 0.5) * 10; ty = (Math.random() - 0.5) * 10; tz = (Math.random() - 0.5) * 10;
        }

        // Standard Lerp Movement
        px += (tx - px) * globalSpeed; py += (ty - py) * globalSpeed; pz += (tz - pz) * globalSpeed;

        // Apply Stealth Dimming
        if (stealthFactor > 0.01) {
            r = r * stealthRMod + stealthPulseOffsetR;
            g = g * stealthGMod + stealthPulseOffsetG;
            b = b * stealthBMod + stealthPulseOffsetB;
        }

        // --- FACE COLOR MAPPING ---
        if ((isFaceMode || isScanning) && faceLandmarks && Number.isFinite(faceColorArray[i3])) {
            let vR = faceColorArray[i3];
            let vG = faceColorArray[i3 + 1];
            let vB = faceColorArray[i3 + 2];
            let luma = 0.299 * vR + 0.587 * vG + 0.114 * vB;

            // Boost brightness for visibility
            luma = Math.max(0.3, luma);

            let targetR = luma * 0.9;
            let targetG = luma * 0.95;
            let targetB = 1.0;

            c[i3] += (targetR - c[i3]) * 0.1;
            c[i3 + 1] += (targetG - c[i3 + 1]) * 0.1;
            c[i3 + 2] += (targetB - c[i3 + 2]) * 0.1;
        }
        else {
            c[i3] += (r - c[i3]) * 0.05;
            c[i3 + 1] += (g - c[i3 + 1]) * 0.05;
            c[i3 + 2] += (b - c[i3 + 2]) * 0.05;
        }

        p[i3] = px; p[i3 + 1] = py; p[i3 + 2] = pz;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
    composer.render();
}

window.onresize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight);
};
animate();