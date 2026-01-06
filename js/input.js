// --- START OF FILE input.js ---

// --- AUDIO HANDLER ---
async function startAudio() {
    try {
        if (!audioContext) {
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
        }
        if (audioContext.state === 'suspended') await audioContext.resume();

        if (globalStream) {
            if (audioSource) { audioSource.disconnect(); audioSource = null; }
            if (audioElement) {
                audioElement.pause();
                const oldSrc = audioElement.src;
                audioElement.src = '';
                if (oldSrc && oldSrc.startsWith('blob:')) { URL.revokeObjectURL(oldSrc); }
                audioElement = null;
            }
            analyser.disconnect();
            
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 256;
            analyser.smoothingTimeConstant = config.audioSmoothing;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            const source = audioContext.createMediaStreamSource(globalStream);
            source.connect(analyser);
            audioSource = source;
            isAudioMode = true;
            isAudioFileMode = false;
            isPaused = false;
            currentFileName = ""; 
            document.getElementById('shape-name').innerText = "VISUALIZER (MIC)";
        } else {
            console.error("Global stream not found");
        }
    } catch (err) {
        console.error("Audio access denied", err);
        isAudioMode = false;
        isAudioFileMode = false;
    }
}

async function startAudioFile(file) {
    // --- FORCE RESET: CLEAR ALL MODES ---
    // This ensures that if Stealth, Supernova, or Face Scan is active,
    // they are immediately disabled so the Visualizer renders correctly.
    faceLocked = false; 
    isScanning = false; 
    isFaceMode = false;
    isSupernova = false; 
    isStealthMode = false; 
    stealthFactor = 0; // Reset brightness instantly
    pinchTimer = 0;
    isSecretActive = false;
    isResetting = false; // Stop any ongoing camera reset
    // ------------------------------------

    try {
        const hint = document.getElementById('start-hint');
        if (hint) {
            hint.style.opacity = '0';
            setTimeout(() => { hint.style.display = 'none'; }, 500);
        }

        if (!audioContext) { audioContext = new (window.AudioContext || window.webkitAudioContext)(); }
        if (audioContext.state === 'suspended') await audioContext.resume();

        if (audioSource) { audioSource.disconnect(); audioSource = null; }
        if (audioElement) {
            audioElement.pause();
            const oldSrc = audioElement.src;
            audioElement.src = '';
            if (oldSrc && oldSrc.startsWith('blob:')) { URL.revokeObjectURL(oldSrc); }
            audioElement = null;
        }

        const url = URL.createObjectURL(file);
        audioElement = new Audio(url);
        audioElement.crossOrigin = 'anonymous';
        audioElement.preload = 'auto';
        audioElement.style.display = 'none';
        document.body.appendChild(audioElement);
        
        await new Promise((resolve, reject) => {
            if (audioElement.readyState >= 2) { resolve(); } 
            else {
                audioElement.onloadedmetadata = resolve;
                audioElement.onerror = reject;
                setTimeout(resolve, 500);
            }
        });
        
        if (analyser) { analyser.disconnect(); }
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 512; 
        analyser.minDecibels = -100; 
        analyser.maxDecibels = -15; 
        analyser.smoothingTimeConstant = config.audioSmoothing; 

        dataArray = new Uint8Array(analyser.frequencyBinCount);
        
        const source = audioContext.createMediaElementSource(audioElement);
        source.connect(analyser);
        analyser.connect(audioContext.destination); 
        
        audioSource = source;
        isAudioMode = true;
        isAudioFileMode = true;
        isPaused = false;
        
        currentFileName = file.name.toUpperCase();
        marqueeStart = Date.now();
        document.getElementById('shape-name').innerText = "VISUALIZER (FILE)";

        audioElement.onended = () => { stopAudio(); };
        audioElement.onerror = (e) => { stopAudio(); };

        await audioElement.play();

    } catch (err) {
        console.error("Audio file error", err);
        stopAudio();
    }
}

function stopAudio() { 
    isAudioMode = false; 
    isAudioFileMode = false;
    isPaused = false;
    currentFileName = "";
    if (audioSource) { audioSource.disconnect(); audioSource = null; }
    if (audioElement) {
        audioElement.pause();
        const oldSrc = audioElement.src;
        audioElement.src = '';
        if (audioElement.parentNode) { audioElement.parentNode.removeChild(audioElement); }
        if (oldSrc && oldSrc.startsWith('blob:')) { URL.revokeObjectURL(oldSrc); }
        audioElement = null;
    }
    if (analyser && isAudioFileMode === false) { analyser.disconnect(); }
    document.getElementById('shape-name').innerText = SHAPES[shapeIdx].toUpperCase(); 
}

// --- FILE PICKER HANDLER (UPDATED) ---
function handleAudioFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        if (file.type.startsWith('audio/')) {
            startAudioFile(file);
        } else {
            console.warn('Selected file is not an audio file');
            // Feedback via the HUD since overlay isn't active
            const shapeName = document.getElementById('shape-name');
            const oldText = shapeName.innerText;
            shapeName.innerText = "FILE NOT SUPPORTED";
            shapeName.style.color = "#ff3333";
            setTimeout(() => {
                shapeName.innerText = oldText;
                shapeName.style.color = "#fff";
            }, 2000);
        }
    }
    event.target.value = '';
}


// --- DETECTION & TRACKING LOOP ---
const colorCanvas = document.getElementById('color-canvas');
const colorCtx = colorCanvas.getContext('2d', { willReadFrequently: true });
const d = (p1, p2) => Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));

async function runDetection() {
    if (!isDetectionRunning) return;
    const vid = document.getElementById('input-video');
    if (!vid.paused && !vid.ended && vid.readyState >= 2) {
        await hands.send({ image: vid });
        await faceMesh.send({ image: vid });
    }
    requestAnimationFrame(runDetection);
}

// --- MEDIAPIPE FACE MESH ---
faceMesh = new FaceMesh({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}` });
faceMesh.setOptions({ maxNumFaces: 1, refineLandmarks: true, minDetectionConfidence: 0.5, minTrackingConfidence: 0.5 });

faceMesh.onResults(results => {
    colorCtx.drawImage(results.image, 0, 0, 320, 240);
    const frameData = colorCtx.getImageData(0, 0, 320, 240).data;

    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        faceLandmarks = results.multiFaceLandmarks[0];
        const cosT = Math.cos(config.faceRotation);
        const sinT = Math.sin(config.faceRotation);

        for (let i = 0; i < COUNT; i++) {
            const lmIdx = i % 468;
            const lm = faceLandmarks[lmIdx];
            const jitter = (Math.random() - 0.5) * 1.5;

            let baseX = (0.5 - lm.x) * config.faceScale;
            let baseZ = -lm.z * config.faceScale;
            let rotX = baseX * cosT - baseZ * sinT;
            let rotZ = baseX * sinT + baseZ * cosT;

            const i3 = i * 3;
            faceTargetArray[i3] = rotX + jitter + config.faceOffsetX;
            faceTargetArray[i3 + 1] = (0.5 - lm.y) * config.faceScale + jitter + config.faceOffsetY;
            faceTargetArray[i3 + 2] = rotZ;

            const px = Math.max(0, Math.min(319, Math.floor(lm.x * 320)));
            const py = Math.max(0, Math.min(239, Math.floor(lm.y * 240)));
            const pIdx = (py * 320 + px) * 4;

            const r = frameData[pIdx];
            const g = frameData[pIdx + 1];
            const b = frameData[pIdx + 2];
            let luma = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
            luma = luma * 3.5; 
            if (luma > 1.0) luma = 1.0;

            faceColorArray[i3]     = luma * 0.9; 
            faceColorArray[i3 + 1] = luma * 0.95; 
            faceColorArray[i3 + 2] = luma * 1.0 + 0.15; 
        }
    } else {
        faceLandmarks = null;
    }
});

// --- MEDIAPIPE HANDS ---
hands = new Hands({ locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}` });
hands.setOptions({ maxNumHands: 2, modelComplexity: config.modelComplexity, minDetectionConfidence: 0.6, minTrackingConfidence: 0.6 });

hands.onResults(results => {
    const numHands = results.multiHandLandmarks ? results.multiHandLandmarks.length : 0;

    if ((numHands === 1 || numHands === 2) && document.getElementById('start-hint')) {
        const hint = document.getElementById('start-hint');
        if (hint.style.opacity !== '0') {
            hint.style.opacity = '0';
            setTimeout(() => { hint.style.display = 'none'; }, 500);
        }
    }

    if (numHands === 2) {
        const h1W = results.multiHandLandmarks[0][0]; const h2W = results.multiHandLandmarks[1][0];
        const wristDist = Math.sqrt(Math.pow(h1W.x - h2W.x, 2) + Math.pow(h1W.y - h2W.y, 2));
        if (wristDist > 0.2 && !faceLocked && !isScanning && !isAudioMode && !isSupernova) {
            const h1 = results.multiHandLandmarks[0][9]; const h2 = results.multiHandLandmarks[1][9];
            isZooming = true; hand.present = true; hand.gesture = 'ZOOM';
            const dist = Math.sqrt(Math.pow(h1.x - h2.x, 2) + Math.pow(h1.y - h2.y, 2));
            if (zoomBaseDist === 0) { zoomBaseDist = dist; zoomBaseRadius = camRadius; }
            else {
                let targetR = zoomBaseRadius - (dist - zoomBaseDist) * 300;
                targetR = Math.max(10, Math.min(250, targetR));
                camRadius += (targetR - camRadius) * 0.1;
            }
        }
    }
    else if (numHands === 1) {
        isZooming = false; zoomBaseDist = 0;
        hand.present = true;
        const lm = results.multiHandLandmarks[0];
        const wrist = lm[0];
        const rawHandX = (1 - lm[8].x) * 2 - 1;
        const rawHandY = -(lm[8].y * 2 - 1);

        smoothHandX += (rawHandX - smoothHandX) * 0.15;
        smoothHandY += (rawHandY - smoothHandY) * 0.15;
        hand.x = smoothHandX;
        hand.y = smoothHandY;

        const isOpen = (tip, pip) => d(lm[tip], wrist) > d(lm[pip], wrist) + 0.05;
        const i = isOpen(8, 5); const m = isOpen(12, 9); const r = isOpen(16, 13); const p = isOpen(20, 17);
        const pinch = d(lm[4], lm[8]) < 0.05;
        const thumbExt = d(lm[4], lm[5]) > 0.08;

        const isRockPose = (i && !m && !r && p);

        let distToMouthIndex = 100;
        let distToMouthKnuckle = 100;
        let isHandNearMouth = false;

        if (faceLandmarks) {
            const upperLip = faceLandmarks[13];
            const lowerLip = faceLandmarks[14];
            const mouthX = (upperLip.x + lowerLip.x) / 2;
            const mouthY = (upperLip.y + lowerLip.y) / 2;
            distToMouthIndex = Math.sqrt(Math.pow(lm[8].x - mouthX, 2) + Math.pow(lm[8].y - mouthY, 2));
            distToMouthKnuckle = Math.sqrt(Math.pow(lm[5].x - mouthX, 2) + Math.pow(lm[5].y - mouthY, 2));
            if (distToMouthIndex < 0.25 || distToMouthKnuckle < 0.25) isHandNearMouth = true;
        }

        let isShhh = (distToMouthIndex < 0.1 && i);
        let isAudioGest = (distToMouthKnuckle < 0.15 && !i && !m && !r && !p);

        if (isShhh) hand.gesture = 'SHHH';
        else if (isAudioGest) hand.gesture = 'AUDIO_TRIG';
        else if (isRockPose) hand.gesture = 'ROCK';
        else if (i && !m && !r && !p) hand.gesture = 'SECRET';
        else if (!i && !m && !r && !p && thumbExt && !isAudioGest && !isHandNearMouth) hand.gesture = 'THUMB';
        else if (pinch) hand.gesture = 'PINCH';
        else if (!i && !m && !r && !p && !thumbExt && !isAudioGest) hand.gesture = 'FIST';
        else if (i && m && !r && !p) hand.gesture = 'PEACE';
        else if (i && m && r && !p) hand.gesture = 'THREE';
        else if (i && m && r && p) hand.gesture = 'OPEN';
        else hand.gesture = 'FIST';
    } else { hand.present = false; hand.gesture = 'NONE'; isZooming = false; zoomBaseDist = 0; }

    if (isStealthMode && (hand.gesture !== 'FIST' && hand.gesture !== 'PEACE' && hand.gesture !== 'OPEN' && hand.gesture !== 'THREE' && hand.gesture !== 'ZOOM')) {
        hand.gesture = 'STEALTH_LOCKED';
    }
    if (isSupernova && (hand.gesture !== 'FIST' && hand.gesture !== 'PEACE' && hand.gesture !== 'OPEN')) {
        hand.gesture = 'SUPERNOVA_LOCKED';
    }
    
    // Audio Mode Gesture Locking
    if (isAudioMode) {
        if (isAudioFileMode) {
            // Allow THREE for Play/Pause in File Mode
            if (hand.gesture !== 'FIST' && hand.gesture !== 'PEACE' && hand.gesture !== 'OPEN' && hand.gesture !== 'THREE') {
                hand.gesture = 'AUDIO_LOCKED';
            }
        } else {
            // Standard Mic Mode
            if (hand.gesture !== 'FIST' && hand.gesture !== 'PEACE' && hand.gesture !== 'OPEN') {
                hand.gesture = 'AUDIO_LOCKED';
            }
        }
    }

    let uiGest = hand.gesture;
    if (uiGest === 'SECRET') uiGest = 'HAH, LOSER';
    if (uiGest === 'ZOOM') uiGest = 'ZOOMING';
    if (uiGest === 'THUMB') uiGest = 'SCAN DETECTED';
    if (uiGest === 'SHHH') uiGest = 'STEALTH MODE';
    if (uiGest === 'AUDIO_TRIG') uiGest = 'MIC TOGGLE';
    
    // Marquee Scrolling Logic
    if (uiGest === 'AUDIO_LOCKED' || (isAudioFileMode && uiGest === 'THREE')) {
        if (isAudioFileMode && currentFileName) {
            if (isPaused) {
                uiGest = "PAUSED";
            } else {
                const maxLen = 20;
                if (currentFileName.length <= maxLen) {
                    uiGest = currentFileName;
                } else {
                    const spacer = "   "; 
                    const fullStr = currentFileName + spacer;
                    const scrollSpeed = 4; // Characters per second
                    const time = (Date.now() - marqueeStart) / 1000;
                    const offset = Math.floor(time * scrollSpeed);
                    const idx = offset % fullStr.length;
                    
                    const doubleStr = fullStr + fullStr;
                    uiGest = doubleStr.substring(idx, idx + maxLen);
                }
            }
        } else {
            uiGest = 'AUDIO ACTIVE';
        }
    }
    
    if (uiGest === 'SUPERNOVA_LOCKED') uiGest = 'SUPERNOVA';
    if (uiGest === 'STEALTH_LOCKED') uiGest = 'SILENCED';
    if (isScanning) uiGest = "INITIALIZING...";
    if (faceLocked) uiGest = 'FACE LOCKED';

    document.getElementById('gesture-display').innerText = uiGest;

    const ctrls = {
        'c-fist': true, 'c-open': true, 'c-zoom': true, 'c-peace': true, 'c-three': true,
        'c-pinch': true, 'c-rock': true, 'c-supernova': true, 'c-shhh': true, 'c-mic': true, 'c-thumb': true
    };

    if (isStealthMode) {
        ctrls['c-pinch'] = false; ctrls['c-rock'] = false; ctrls['c-supernova'] = false;
        ctrls['c-shhh'] = false; ctrls['c-mic'] = false; ctrls['c-thumb'] = false;
    } else if (isSupernova) {
        ctrls['c-zoom'] = false; ctrls['c-three'] = false; ctrls['c-pinch'] = false; ctrls['c-rock'] = false;
        ctrls['c-supernova'] = false; ctrls['c-shhh'] = false; ctrls['c-mic'] = false; ctrls['c-thumb'] = false;
    } else if (isAudioMode) {
        ctrls['c-zoom'] = false; ctrls['c-pinch'] = false; ctrls['c-rock'] = false;
        ctrls['c-supernova'] = false; ctrls['c-shhh'] = false; ctrls['c-thumb'] = false; ctrls['c-mic'] = false;
        
        // Enable THREE only in File Mode
        if (isAudioFileMode) {
            ctrls['c-three'] = true;
        } else {
            ctrls['c-three'] = false;
        }
    } else if (faceLocked || isScanning) {
        for (let k in ctrls) ctrls[k] = false;
        ctrls['c-fist'] = true;
        ctrls['c-peace'] = true;
    }

    for (let id in ctrls) {
        const el = document.getElementById(id);
        if (ctrls[id]) el.classList.remove('disabled');
        else el.classList.add('disabled');
        el.classList.remove('active');
    }

    // Dynamic Labels
    const threeLabel = document.querySelector('#c-three .c-action');
    if (isAudioFileMode) threeLabel.innerText = "PLAY / PAUSE";
    else threeLabel.innerText = "TIME FREEZE";

    const fistLabel = document.querySelector('#c-fist .c-action');
    if (isAudioMode) {
        fistLabel.innerText = "EXIT VISUALIZER";
    } else if (isSupernova) {
        fistLabel.innerText = "STOP SUPERNOVA";
    } else if (isStealthMode) {
        fistLabel.innerText = "EXIT STEALTH";
    } else if (faceLocked || isScanning) {
        fistLabel.innerText = "EXIT SCAN";
    } else {
        fistLabel.innerText = "IDLE POSITION";
    }

    const map = { 'FIST': 'c-fist', 'OPEN': 'c-open', 'PINCH': 'c-pinch', 'ROCK': 'c-rock', 'THREE': 'c-three', 'PEACE': 'c-peace', 'ZOOM': 'c-zoom', 'THUMB': 'c-thumb', 'SHHH': 'c-shhh', 'AUDIO_TRIG': 'c-mic', 'SUPERNOVA_LOCKED': 'c-supernova' };
    if (isSupernova) document.getElementById('c-supernova').classList.add('active');
    else if (map[hand.gesture]) document.getElementById(map[hand.gesture]).classList.add('active');
});