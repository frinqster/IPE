// --- START OF FILE ui.js ---

// --- TITLE TYPING EFFECT ---
const titleText = "WELCOME TO THE IPE";
let charIdx = 0;
function typeWriter() {
    if (charIdx < titleText.length) {
        document.getElementById("type-title").innerHTML += titleText.charAt(charIdx);
        charIdx++;
        setTimeout(typeWriter, 100);
    }
}
window.onload = typeWriter;

// --- PERFORMANCE SELECTOR UI ---
// --- PERFORMANCE SELECTOR UI ---
function showPerfSelector() {
    const btn = document.getElementById('init-btn');
    btn.classList.add('l-btn-exit');

    // Wait for exit animation
    setTimeout(() => {
        btn.style.display = 'none';
        const selector = document.getElementById('perf-selector');
        selector.style.display = 'flex';

        // Staggered Entrance
        const options = document.querySelectorAll('.perf-option');
        options.forEach((opt, index) => {
            setTimeout(() => {
                opt.style.opacity = '1';
                opt.classList.add('animate-in');

                // Remove animation class after completion to unlock hover transform
                setTimeout(() => {
                    opt.classList.remove('animate-in');
                    opt.classList.add('visible');
                }, 500);
            }, index * 100);
        });

        perfSelectionIndex = 1;
        updatePerfVisuals();
        document.addEventListener('keydown', handlePerfKey);
    }, 400);
}

function handlePerfKey(e) {
    const options = document.querySelectorAll('.perf-option');
    if (e.key === 'ArrowDown') {
        perfSelectionIndex = (perfSelectionIndex + 1) % options.length;
        updatePerfVisuals();
    } else if (e.key === 'ArrowUp') {
        perfSelectionIndex = (perfSelectionIndex - 1 + options.length) % options.length;
        updatePerfVisuals();
    } else if (e.key === 'Enter') {
        options[perfSelectionIndex].click();
    }
}

function updatePerfVisuals() {
    const options = document.querySelectorAll('.perf-option');
    options.forEach((opt, idx) => {
        if (idx === perfSelectionIndex) opt.classList.add('selected');
        else opt.classList.remove('selected');
    });
}

function setPerfIndex(i) {
    perfSelectionIndex = i;
    updatePerfVisuals();
}

// --- GENERAL UI TOGGLES ---
function toggleMenu() { document.getElementById('controls-panel').classList.toggle('expanded'); }
function toggleRef(el) { el.classList.toggle('active'); }
function toggleNc(el) { el.classList.toggle('active'); }

// --- FLIP CARD LOGIC ---
function flipCard(event, btn) {
    event.stopPropagation();

    const container = btn.closest('.gesture-flip-container');
    const items = container.querySelectorAll('.gesture-item');
    const item1 = items[0];
    const item2 = items[1];

    // Determine which side is active
    let activeItem, nextItem;
    if (item1.style.display !== 'none') {
        activeItem = item1;
        nextItem = item2;
    } else {
        activeItem = item2;
        nextItem = item1;
    }

    const wasActive = activeItem.classList.contains('active');

    // Animate out
    activeItem.classList.add('gesture-flip-anim-out');

    setTimeout(() => {
        activeItem.style.display = 'none';
        activeItem.classList.remove('gesture-flip-anim-out');

        // Animate in
        nextItem.style.display = 'block';
        nextItem.classList.add('gesture-flip-anim-in');

        // Maintain expanded state
        if (wasActive) {
            nextItem.classList.add('active');
        }

        setTimeout(() => {
            nextItem.classList.remove('gesture-flip-anim-in');
        }, 300);
    }, 300);
}

// --- JUMP TO VISUALIZER FILE SECTION ---
function jumpToVisualizerFile(event) {
    if (event) event.stopPropagation();

    const container = document.getElementById('g-container-visualizer');
    if (!container) return;

    container.scrollIntoView({ behavior: 'smooth', block: 'center' });

    const items = container.querySelectorAll('.gesture-item');
    const front = items[0];
    const back = items[1];

    if (front.style.display !== 'none') {
        const btn = front.querySelector('.flip-btn');
        if (btn) {
            const fakeEvent = { stopPropagation: () => { } };
            flipCard(fakeEvent, btn);
        }
    }

    setTimeout(() => {
        const visibleItem = (front.style.display !== 'none') ? front : back;
        if (!visibleItem.classList.contains('active')) {
            visibleItem.classList.add('active');
        }

        visibleItem.classList.add('highlight-flash');
        setTimeout(() => visibleItem.classList.remove('highlight-flash'), 2000);
    }, 350);
}

// --- HIGHLIGHT AUDIO SETTINGS (IN MANUAL) ---
function highlightAudioSettings(event) {
    if (event) event.stopPropagation();

    const audioLinkAccordion = document.getElementById('nc-audio-link');
    const audioInputLi = document.getElementById('li-audio-input');

    if (audioLinkAccordion) {
        if (!audioLinkAccordion.classList.contains('active')) {
            audioLinkAccordion.classList.add('active');
        }

        setTimeout(() => {
            if (audioInputLi) {
                audioInputLi.scrollIntoView({ behavior: 'smooth', block: 'center' });
                audioInputLi.classList.add('highlight-flash');
                setTimeout(() => audioInputLi.classList.remove('highlight-flash'), 2000);
            }
        }, 300);
    }
}

function toggleCamPos() {
    const el = document.getElementById('cam-container');
    const setEl = document.getElementById('settings-trigger');
    const screenEl = document.getElementById('screenshot-trigger');

    if (el.classList.contains('pos-left')) {
        el.classList.remove('pos-left'); el.classList.add('pos-right');
        setEl.classList.remove('pos-right'); setEl.classList.add('pos-left');
        screenEl.classList.remove('pos-right'); screenEl.classList.add('pos-left');
    }
    else {
        el.classList.remove('pos-right'); el.classList.add('pos-left');
        setEl.classList.remove('pos-left'); setEl.classList.add('pos-right');
        screenEl.classList.remove('pos-left'); screenEl.classList.add('pos-right');
    }
}

function openModal(id) { document.getElementById(id).style.display = 'block'; }

// --- UPDATED CLOSE MODAL FUNCTION ---
function closeModal(id) {
    document.getElementById(id).style.display = 'none';

    // Perform cleanup if we are closing the Help Overlay
    if (id === 'help-overlay') {
        // 1. Collapse any expanded gesture cards or accordion items
        const activeItems = document.querySelectorAll('.gesture-item.active, .nc-item.active');
        activeItems.forEach(item => item.classList.remove('active'));

        // 2. Remove the flash/highlight animation class from ANY element that has it
        const flashedItems = document.querySelectorAll('.highlight-flash');
        flashedItems.forEach(item => item.classList.remove('highlight-flash'));
    }
}

function openSettings() { document.getElementById('settings-panel').classList.add('active'); }
function closeSettings() { document.getElementById('settings-panel').classList.remove('active'); }

// --- AUDIO FILE UPLOAD HANDLER ---
function handleAudioFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
        startAudioFile(file);
        event.target.value = '';
    } else {
        console.warn('Selected file is not an audio file');
        event.target.value = '';
    }
}

// --- SCREENSHOT LOGIC ---
function takeScreenshot() {
    if (typeof composer !== 'undefined') {
        composer.render();
    } else if (typeof renderer !== 'undefined' && typeof scene !== 'undefined' && typeof camera !== 'undefined') {
        renderer.render(scene, camera);
    }

    const dataURL = renderer.domElement.toDataURL('image/png');
    const link = document.createElement('a');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    link.download = `IPE_Screenshot_${timestamp}.png`;
    link.href = dataURL;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// --- ADVANCED COLOR PICKER LOGIC ---
let cpState = {
    h: 210, s: 100, v: 100,
    mode: 'HEX',
    dragging: false
};

function toggleColorConsole() {
    const el = document.getElementById('cyber-color-console');
    el.classList.toggle('active');
}

function switchColorView(view) {
    document.getElementById('cp-presets-view').style.display = view === 'presets' ? 'block' : 'none';
    document.getElementById('cp-custom-view').style.display = view === 'custom' ? 'block' : 'none';

    if (view === 'custom') {
        syncPickerToCurrentColor();
    }
}

function applyPreset(hex) {
    updateConfig('idleColor', hex);
    toggleColorConsole();
}

// --- SYNC FUNCTIONALITY ---
function syncPickerToCurrentColor() {
    const currentHex = config.idleColor || '#0099ff';
    const rgb = hexToRgb(currentHex);
    const hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);

    cpState.h = hsv.h * 360;
    cpState.s = hsv.s * 100;
    cpState.v = hsv.v * 100;

    document.getElementById('cp-hue-slider').value = cpState.h;

    const svBox = document.getElementById('cp-sv-box');
    const svHandle = document.getElementById('cp-sv-handle');

    svHandle.style.left = cpState.s + '%';
    svHandle.style.top = (100 - cpState.v) + '%';
    document.getElementById('cp-sv-bg').style.backgroundColor = `hsl(${cpState.h}, 100%, 50%)`;
    updateInputLabel(rgb, currentHex, cpState.h, cpState.s, cpState.v);
}

const svBox = document.getElementById('cp-sv-box');
const svHandle = document.getElementById('cp-sv-handle');

svBox.addEventListener('mousedown', (e) => {
    cpState.dragging = true;
    updateSVFromMouse(e);
});

window.addEventListener('mousemove', (e) => {
    if (cpState.dragging) updateSVFromMouse(e);
});

window.addEventListener('mouseup', () => {
    cpState.dragging = false;
});

function updateSVFromMouse(e) {
    const rect = svBox.getBoundingClientRect();
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    x = Math.max(0, Math.min(x, rect.width));
    y = Math.max(0, Math.min(y, rect.height));

    svHandle.style.left = x + 'px';
    svHandle.style.top = y + 'px';

    cpState.s = (x / rect.width) * 100;
    cpState.v = 100 - ((y / rect.height) * 100);

    syncColorFromHSV();
}

function onHueChange(val) {
    cpState.h = parseInt(val) % 360;
    document.getElementById('cp-sv-bg').style.backgroundColor = `hsl(${cpState.h}, 100%, 50%)`;
    syncColorFromHSV();
}

function syncColorFromHSV() {
    const { h, s, v } = cpState;
    const rgb = hsvToRgb(h, s, v);
    const hex = rgbToHex(rgb.r, rgb.g, rgb.b);

    updateInputLabel(rgb, hex, h, s, v);
    updateConfig('idleColor', hex);
}

function toggleInputMode() {
    const modes = ['HEX', 'RGB', 'HSL'];
    let idx = modes.indexOf(cpState.mode);
    cpState.mode = modes[(idx + 1) % modes.length];
    document.getElementById('cp-mode-label').innerText = cpState.mode;
    syncColorFromHSV();
}

function updateInputLabel(rgb, hex, h, s, v) {
    const input = document.getElementById('cp-input-val');
    if (cpState.mode === 'HEX') {
        input.value = hex;
    } else if (cpState.mode === 'RGB') {
        input.value = `${rgb.r}, ${rgb.g}, ${rgb.b}`;
    } else if (cpState.mode === 'HSL') {
        input.value = `${Math.round(h)}°, ${Math.round(s)}%, ${Math.round(v)}%`;
    }
}

function onManualInput(val) {
    if (val.startsWith('#') && val.length === 7) {
        updateConfig('idleColor', val);
        syncPickerToCurrentColor();
    }
}

function hsvToRgb(h, s, v) {
    s /= 100; v /= 100;
    let c = v * s;
    let x = c * (1 - Math.abs(((h / 60) % 2) - 1));
    let m = v - c;
    let r = 0, g = 0, b = 0;
    if (0 <= h && h < 60) { r = c; g = x; b = 0; }
    else if (60 <= h && h < 120) { r = x; g = c; b = 0; }
    else if (120 <= h && h < 180) { r = 0; g = c; b = x; }
    else if (180 <= h && h < 240) { r = 0; g = x; b = c; }
    else if (240 <= h && h < 300) { r = x; g = 0; b = c; }
    else if (300 <= h && h < 360) { r = c; g = 0; b = x; }
    return { r: Math.round((r + m) * 255), g: Math.round((g + m) * 255), b: Math.round((b + m) * 255) };
}

function rgbToHsv(r, g, b) {
    r /= 255; g /= 255; b /= 255;
    let max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h, s, v = max;
    let d = max - min;
    s = max === 0 ? 0 : d / max;

    if (max === min) {
        h = 0;
    } else {
        switch (max) {
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return { h: h, s: s, v: v };
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : { r: 0, g: 153, b: 255 };
}

function toggleBlur() {
    const newState = !config.motionBlur;

    config.motionBlur = newState;

    const btn = document.getElementById('blur-toggle-btn');
    const container = document.getElementById('blur-intensity-container');
    const txt = btn.querySelector('.toggle-text');

    if (newState) {
        btn.classList.add('active');
        container.classList.add('active');
        txt.innerText = "ON";
    } else {
        btn.classList.remove('active');
        container.classList.remove('active');
        txt.innerText = "OFF";
    }

    checkDirty();
}

function toggleVibration() {
    const newState = !config.supernovaVibration;

    config.supernovaVibration = newState;

    const btn = document.getElementById('vib-toggle-btn');
    const txt = btn.querySelector('.toggle-text');

    if (newState) {
        btn.classList.add('active');
        txt.innerText = "ON";
    } else {
        btn.classList.remove('active');
        txt.innerText = "OFF";
    }

    checkDirty();
}

// --- HELPER: GET BLUR FOR COUNT ---
function getBlurForCount(count) {
    if (count <= 6000) return 0.75;
    if (count <= 12000) return 0.65;
    if (count <= 20000) return 0.45;
    return 0.2; // Ultra
}

// --- CUSTOM DROPDOWN LOGIC ---
function togglePerfDropdown() {
    const dropdown = document.getElementById('perf-dropdown');
    dropdown.classList.toggle('active');
}

function selectPerfOption(val, label) {
    // Update UI
    document.getElementById('perf-selected').innerText = label;
    document.getElementById('perf-dropdown').classList.remove('active');

    // Trigger Config Update
    updateConfig('perf', val);
}

// Close dropdown when clicking outside
window.addEventListener('click', function (e) {
    const dropdown = document.getElementById('perf-dropdown');
    if (dropdown && !dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
    }
});

// --- CONFIGURATION UPDATES ---
function updateConfig(key, rawVal) {
    if (key === 'blur') {
        config.motionBlur = (rawVal === 'true');
        checkDirty();
        return;
    }

    if (key === 'perf') {
        const val = parseInt(rawVal);
        config.particleCount = val;
        config.modelComplexity = (val <= 12000) ? 0 : 1;

        const newBlurStr = getBlurForCount(val);
        config.blurStrength = newBlurStr;

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
        if (typeof initParticles === 'function') initParticles(val);
        checkDirty();
        return;
    }

    if (key === 'idleColor') {
        config.idleColor = rawVal;
        const rgb = hexToRgb(rawVal);
        config.idleColorRGB = { r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 };

        const previewEl = document.getElementById('color-preview');
        if (previewEl) previewEl.style.backgroundColor = rawVal;

        checkDirty();
        return;
    }

    const val = parseFloat(rawVal);
    if (key === 'blurStr') config.blurStrength = val;
    if (key === 'rot') config.rotSpeed = val;
    if (key === 'sens') config.openSens = val;
    if (key === 'rock') config.rockSpeed = val;
    if (key === 'audio') config.audioSensitivity = val;
    if (key === 'audioRot') config.audioRotSpeed = val;

    if (key === 'aBars') config.audioBarCount = parseInt(val);
    if (key === 'aSmooth') {
        config.audioSmoothing = val;
        if (typeof analyser !== 'undefined' && analyser) analyser.smoothingTimeConstant = val;
    }

    if (key === 'x') config.faceOffsetX = val;
    if (key === 'y') config.faceOffsetY = val;
    if (key === 'scale') config.faceScale = val;
    if (key === 'faceRot') config.faceRotation = val;
    if (key === 'sMin') config.stealthMin = val;
    if (key === 'sMax') config.stealthMax = val;
    if (key === 'sSpeed') config.stealthSpeed = val;
    if (key === 'charge') config.supernovaCharge = val;
    if (key === 'sForce') config.supernovaForce = val;

    const displayEl = document.getElementById('v-' + key);
    if (displayEl) displayEl.innerText = val;

    checkDirty();
}

function checkDirty() {
    const current = { ...config };
    const def = { ...defaults };
    delete current.particleCount; delete def.particleCount;
    delete current.modelComplexity; delete def.modelComplexity;
    delete current.idleColorRGB; delete def.idleColorRGB;

    const targetBlur = getBlurForCount(config.particleCount);
    def.blurStrength = targetBlur;

    const isDirty = JSON.stringify(current) !== JSON.stringify(def);
    document.getElementById('reset-btn').style.display = isDirty ? 'block' : 'none';
}

function resetConfig() {
    const currentPerf = config.particleCount;
    const currentComplexity = (currentPerf <= 12000) ? 0 : 1;

    config = { ...defaults };
    config.particleCount = currentPerf;
    config.modelComplexity = currentComplexity;

    config.blurStrength = getBlurForCount(currentPerf);

    const keys = ['rot', 'sens', 'rock', 'audio', 'audioRot', 'aBars', 'aSmooth', 'x', 'y', 'scale', 'faceRot', 'sMin', 'sMax', 'sSpeed', 'charge', 'sForce', 'blurStr'];
    const map = {
        rot: 'rotSpeed', sens: 'openSens', rock: 'rockSpeed',
        audio: 'audioSensitivity', audioRot: 'audioRotSpeed',
        aBars: 'audioBarCount', aSmooth: 'audioSmoothing',
        x: 'faceOffsetX', y: 'faceOffsetY',
        scale: 'faceScale', faceRot: 'faceRotation', sMin: 'stealthMin',
        sMax: 'stealthMax', sSpeed: 'stealthSpeed', charge: 'supernovaCharge',
        sForce: 'supernovaForce',
        blurStr: 'blurStrength'
    };

    keys.forEach(k => {
        const val = config[map[k]];
        const el = document.getElementById('i-' + k);
        if (el) el.value = val;
        const vEl = document.getElementById('v-' + k);
        if (vEl) vEl.innerText = val;
    });

    config.motionBlur = true;
    const btn = document.getElementById('blur-toggle-btn');
    const container = document.getElementById('blur-intensity-container');
    const txt = btn.querySelector('.toggle-text');
    btn.classList.add('active');
    container.classList.add('active');
    txt.innerText = "ON";

    config.supernovaVibration = true;
    const vibBtn = document.getElementById('vib-toggle-btn');
    const vibTxt = vibBtn.querySelector('.toggle-text');
    vibBtn.classList.add('active');
    vibTxt.innerText = "ON";

    const previewEl = document.getElementById('color-preview');
    if (previewEl) previewEl.style.backgroundColor = defaults.idleColor;

    document.getElementById('cyber-color-console').classList.remove('active');
    switchColorView('presets');

    if (typeof analyser !== 'undefined' && analyser) analyser.smoothingTimeConstant = config.audioSmoothing;

    checkDirty();
}

const carouselData = {
    'zoom': [
        { src: 'References/zoom1.png', label: 'HAND POSITION REFERENCE' },
        { src: 'Assets/References/zoom2.png', label: 'ZOOM IN (MOVE HANDS APART)' },
        { src: 'Assets/References/zoom3.png', label: 'ZOOM OUT (MOVE HANDS CLOSER)' }
    ],
    'pinch': [
        { src: 'Assets/References/pinch1.png', label: 'FRONT VIEW' },
        { src: 'Assets/References/pinch2.png', label: 'SIDE VIEW' }
    ],
    'rock': [
        { src: 'Assets/References/rock1.png', label: 'VERSION A' },
        { src: 'Assets/References/rock2.png', label: 'VERSION B' }
    ],
    'supernova': [
        { src: 'Assets/References/pinch1.png', label: 'FRONT VIEW' },
        { src: 'Assets/References/pinch2.png', label: 'SIDE VIEW' }
    ],
    'mic': [
        { src: 'Assets/References/mic1.png', label: 'FRONT VIEW' },
        { src: 'Assets/References/mic2.png', label: 'SIDE VIEW' }
    ]

};

const carouselState = {
    'zoom': 0, 'pinch': 0, 'supernova': 0, 'mic': 0, "rock": 0
};

function changeSlide(event, key, direction) {
    event.stopPropagation();
    const data = carouselData[key];
    let newIndex = carouselState[key] + direction;
    if (newIndex < 0) {
        newIndex = data.length - 1;
    } else if (newIndex >= data.length) {
        newIndex = 0;
    }
    carouselState[key] = newIndex;
    const imgElement = document.getElementById('ref-' + key);
    if (imgElement) {
        imgElement.src = data[newIndex].src;
    }
    const capElement = document.getElementById('cap-' + key);
    if (capElement) {
        capElement.innerText = data[newIndex].label;
    }
}

function openHelpNeural() {
    closeSettings();
    openModal('help-overlay');
    setTimeout(() => {
        const wrapper = document.getElementById('neural-section-wrapper');
        if (wrapper) {
            wrapper.scrollIntoView({ behavior: 'smooth', block: 'start' });
            wrapper.classList.remove('highlight-flash');
            void wrapper.offsetWidth;
            wrapper.classList.add('highlight-flash');
        }
    }, 100);
}

function openHelpPerformance() {
    openModal('help-overlay');
    setTimeout(() => {
        const header = document.getElementById('neural-header');
        const systemCore = document.getElementById('nc-system-core');
        const perfLi = document.getElementById('li-perf-mode');

        if (header) header.scrollIntoView({ behavior: 'smooth', block: 'start' });

        if (systemCore && !systemCore.classList.contains('active')) {
            systemCore.classList.add('active');
        }

        if (perfLi) {
            perfLi.classList.remove('highlight-flash');
            void perfLi.offsetWidth;
            perfLi.classList.add('highlight-flash');
        }
    }, 100);
}

function jumpToGesture(event, id) {
    if (event) event.stopPropagation();

    const el = document.getElementById(id);
    if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        if (!el.classList.contains('active')) {
            el.classList.add('active');
        }
        el.classList.remove('highlight-flash');
        void el.offsetWidth;
        el.classList.add('highlight-flash');
    }
}