// --- START OF FILE js/state.js ---

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
    secretBuffer: 1,

    // --- VOICE CONTROL ---
    voiceEnabled: true
};

let config = { ...defaults };

// --- SHAPE CONFIGURATION ---
const SHAPES = [

    // ────────── BASIC GEOMETRY (MATHS) ────────── 
    'Sphere',
    'Cube',
    'Pyramid',
    'Heart',
    'Plane',

    // ────────── PLATONIC SOLIDS (MATHS) ────────── 
    'Tetrahedron',
    'Octahedron',
    'Dodecahedron',
    'Icosahedron',

    // ────────── QUADRIC & SOLID FORMS (MATHS) ────────── 
    'Ellipsoid',
    'Cone',
    'Cylinder',
    'Frustum',
    'Torus',

    // ────────── CURVES & MOTION FORMS (MATHS) ────────── 
    'Wave',
    'Spiral',
    'Helix',
    'Arrow',
    'Spring',
    'Lissajous Curve',
    'Infinity Symbol',

    // ────────── ADVANCED SURFACES (MATHS) ────────── 
    'Hyperboloid',
    'Saddle Surface',

    // ────────── ABSTRACT / TOPOLOGY (MODEL) ────────── 
    'Metatron Cube',
    'Fractal',
    'Julia Set',
    'Mobius Strip',
    'Klein Bottle',

    // ────────── SCIENTIFIC / MICRO STRUCTURES (MODEL) ────────── 
    'Atom',
    'Cell',
    'Neuron',
    'DNA',

    // ────────── HUMAN ANATOMY (MODEL) ────────── 
    'Brain',
    'Human Heart',
    'Hand',
    'Skull',
    'Human',

    // ────────── OBJECTS (MODEL) ────────── 
    'Shoe',

    // ────────── COSMIC SCALE (MATHS & MODEL) ────────── 
    'Saturn',
    'Galaxy'
];

// --- MODEL CONFIGURATION ---
// Define URL, Rotation (in Radians), and Scale multiplier for each model.
const MODEL_CONFIG = {

    // ────────── ABSTRACT / TOPOLOGY ────────── 
    'Metatron Cube': {
        url: 'Assets/Models/metatron_cube.glb',
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        scale: 1.0
    },
    'Fractal': {
        url: 'Assets/Models/fractal.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'Julia Set': {
        url: 'Assets/Models/julia_set.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'Mobius Strip': {
        url: 'Assets/Models/mobius_strip.glb',
        rotation: { x: 135 * (Math.PI / 180), y: 0, z: 0 },
        scale: 1.5
    },
    'Klein Bottle': {
        url: 'Assets/Models/klein_bottle.glb',
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        scale: 1.5
    },

    // ────────── SCIENTIFIC / MICRO STRUCTURES ────────── 
    'Atom': {
        url: 'Assets/Models/atom.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'Cell': {
        url: 'Assets/Models/cell.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'Neuron': {
        url: 'Assets/Models/neuron.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'DNA': {
        url: 'Assets/Models/dna.glb',
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        scale: 1.5
    },

    // ────────── HUMAN ANATOMY ────────── 
    'Brain': {
        url: 'Assets/Models/brain.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'Human Heart': {
        url: 'Assets/Models/human_heart.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },
    'Hand': {
        url: 'Assets/Models/hand.glb',
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        scale: 1.5
    },
    'Skull': {
        url: 'Assets/Models/skull.glb',
        rotation: { x: -Math.PI / 2, y: 0, z: 0 },
        scale: 1.15
    },
    'Human': {
        url: 'Assets/Models/human.glb',
        rotation: { x: Math.PI / 2, y: 0, z: 0 },
        scale: 1.5
    },

    // ────────── OBJECTS / SYMBOLIC ITEMS ────────── 
    'Shoe': {
        url: 'Assets/Models/shoes.glb',
        rotation: { x: 0, y: 0, z: 0 },
        scale: 1.5
    },

    // ────────── SPECIAL / SECRET ────────── 
    'Secret': {
        url: 'Assets/Models/secret.glb',
        rotation: { x: -Math.PI / 2, y: 0, z: Math.PI / 2 },
        scale: 1.5
    }
};

// --- LOADER SETUP (WITH DRACO COMPRESSION) ---
// Cache to store processed particle data so we don't reload models every time
const modelDataCache = {};

const loader = new THREE.GLTFLoader();

// Configure Draco Decoder
const dracoLoader = new THREE.DRACOLoader();
// Using Google's CDN for the decoder WASM files
dracoLoader.setDecoderPath('https://www.gstatic.com/draco/versioned/decoders/1.4.1/');
dracoLoader.setDecoderConfig({ type: 'js' });
loader.setDRACOLoader(dracoLoader);

let shapeIdx = 0;

// --- GLOBAL STATE FLAGS ---
let globalStream = null;
let isDetectionRunning = false;
let perfSelectionIndex = 1;

let isResetting = false;

// Buffer Timers
let peaceTimer = 0;
let pinchBufferTimer = 0;
let secretBufferTimer = 0;

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

// --- VOICE STATE ---
let recognition = null;
let isVoiceProcessing = false;

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