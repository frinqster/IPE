// --- START OF FILE state.js ---

// --- CONFIGURATION & DEFAULTS ---
const defaults = {
    rotSpeed: 0.005,
    openSens: 2.5,
    rockSpeed: 0.1,
    audioSensitivity: 30,
    audioRotSpeed: 0.2, // Visualizer Rotation Speed
    audioBarCount: 128,
    audioSmoothing: 0.85,
    faceOffsetX: 10,
    faceOffsetY: 35,
    faceScale: 200,
    faceRotation: -0.1,
    stealthMin: 0.05,
    stealthMax: 0.5,
    stealthSpeed: 2,
    supernovaCharge: 4.0,
    supernovaForce: 4.0,
    supernovaVibration: true,
    particleCount: 20000,
    modelComplexity: 1, 
    motionBlur: true,   
    blurStrength: 0.75, 
    idleColor: '#0099ff', 
    idleColorRGB: { r: 0, g: 0.6, b: 1.0 },
    
    // --- GESTURE BUFFERS (Seconds) ---
    pinchBuffer: 0.5, 
    peaceBuffer: 0.5,
    secretBuffer: 1 // NEW: Secret Gesture Buffer
};

let config = { ...defaults };

const SHAPES = ['Sphere', 'Heart', 'Saturn', 'Human', 'Pyramid', 'Cube', 'Galaxy', 'Plane'];
let shapeIdx = 0;

// --- GLOBAL STATE FLAGS ---
let globalStream = null;
let isDetectionRunning = false;
let perfSelectionIndex = 1;

let isResetting = false; 

// Buffer Timers
let peaceTimer = 0;       
let pinchBufferTimer = 0; 
let secretBufferTimer = 0; // NEW: Timer for Secret Gesture

let isSecretActive = false;
let secretTimer = 0;
let isFaceMode = false;
let isScanning = false;
let scanTimer = 0;
let faceLocked = false;

let isStealthMode = false;
let stealthFactor = 0;

let pinchTimer = 0;
let lastPinchTime = 0;
let isSupernova = false;
let supernovaVibeTimer = 0; 

let isAudioMode = false;
let isAudioFileMode = false; 
let isPaused = false; 
let currentFileName = ""; 
let marqueeStart = 0; 
let audioContext, analyser, dataArray;
let audioSource = null; 
let audioElement = null; 
let audioToggleCooldown = 0;
let visRotation = 0;
let audioTransition = 0;

// --- THREE.JS GLOBALS ---
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x000000, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
let camRadius = 90;
let camTheta = 0;
let camPhi = Math.PI / 2;
camera.position.z = camRadius;

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
let composer; 
let afterimagePass; 

// --- PARTICLE SYSTEM GLOBALS ---
let particles;
let geometry;
let posArray, colArray, sizeArray, targetArray, secretTargetArray, faceTargetArray, faceColorArray;
let COUNT = 20000;

// --- INPUT & TRACKING GLOBALS ---
let hand = { present: false, x: 0, y: 0, gesture: 'FIST' };
let smoothHandX = 0;
let smoothHandY = 0;

let cooldown = 0;
let isZooming = false;
let zoomBaseDist = 0;
let zoomBaseRadius = 0;

let faceLandmarks = null;
let hands, faceMesh;

// --- UTILS ---
const clock = new THREE.Clock();
let wasDragging = false;
let lastHandX = 0;
let lastHandY = 0;
let frameCount = 0;