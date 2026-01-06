# INTERACTIVE PARTICLE ENGINE [IPE] v1.2

![Project Banner](Assets/Logo/social-preview.jpg)

> **A Gesture-Controlled 3D Interface.**  
> Control up to 32,000 particles with your hands directly in the browser using WebGL and Computer Vision.

[![License: MIT](https://img.shields.io/badge/License-MIT-00ffcc.svg)](https://opensource.org/licenses/MIT)
[![Three.js](https://img.shields.io/badge/Powered%20by-Three.js-white.svg)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/AI-MediaPipe-blue.svg)](https://google.github.io/mediapipe/)

---

## 📑 TABLE OF CONTENTS
1. [System Overview](#-system-overview)
2. [Live Demo](#-live-demo)
3. [Documentation](#-documentation)
4. [Gesture Controls](#-gesture-controls)
5. [Tech Stack](#-tech-stack)
6. [Installation & Setup](#-installation--setup)
7. [Configuration](#-configuration)
8. [Troubleshooting](#-troubleshooting)
9. [Author](#-author)

---

## ⚡ SYSTEM OVERVIEW

The **Interactive Particle Engine (IPE)** is an advanced experiment in spatial UI and generative art. It leverages **Three.js** for high-performance WebGL rendering and **MediaPipe** for real-time, client-side hand and face tracking.

The system maps physical movements to a digital particle cloud, allowing users to manipulate 3D geometry, control time, and visualize audio frequencies without touching a mouse or keyboard.

### ✨ KEY FEATURES
*   **Real-time AI Tracking:** Detects hands and face landmarks instantly.
*   **32,000+ Particles:** GPU-accelerated simulation with custom shaders.
*   **Post-Processing Stack:** Cinematic visuals with Unreal Bloom and Motion Blur (Afterimage).
*   **Audio Reactive:** 
    *   **Microphone Mode:** Visualize your voice or ambient sound.
    *   **File Mode:** Drag & drop MP3/WAV files for custom frequency analysis.
*   **Face Geometry Mapping:** Morph particles into a 3D scan of your face.
*   **Stealth & Supernova Modes:** Special physics interactions.
*   **Privacy Focused:** All processing is done **locally** on your device. No video is sent to the cloud.

---

## 🌐 LIVE DEMO

*   **Primary Link:** [project-ipe.netlify.app](https://project-ipe.netlify.app/)
*   **Alternative Link:** [frinqster.github.io/IPE](https://frinqster.github.io/IPE)

*(Note: Requires Camera & Microphone access)*

---

## 📄 DOCUMENTATION

For a deep dive into the system architecture, mathematical models, and operational logic, please refer to the official technical documentation included in the repository:

[**📥 Download Technical Specification (PDF)**](Docs/IPE%20Documentation.pdf)

---

## 🎮 GESTURE CONTROLS

The system is controlled entirely by hand movements. Ensure your hand is visible and the lighting is good.

| Gesture | Action | Description |
| :--- | :--- | :--- |
| **✊ FIST** | **RESET / IDLE** | Resets the system to default state. Exits any active mode. |
| **🖐 OPEN HAND** | **ROTATE CAMERA** | Move your hand to look around the 3D scene. |
| **👐 TWO HANDS** | **ZOOM** | Move hands apart to zoom in, close to zoom out. |
| **✌️ PEACE SIGN** | **NEXT SHAPE** | Cycles through 3D forms (Sphere, Cube, Galaxy, Human, etc.). |
| **👌 PINCH** | **IMPLODE** | Collapses particles to the center. |
| **🤘 ROCK ON** | **EXPLODE** | Scatters particles chaotically. |
| **🤫 INDEX TO LIP** | **STEALTH MODE** | Dims lights and activates pulsing silent mode. |
| **👍 THUMBS UP** | **FACE SCAN** | Maps the particle cloud to your face geometry. |
| **👊 FIST TO MOUTH** | **MIC VISUALIZER** | Activates microphone-based frequency bars. |
| **👌 PINCH (HOLD)** | **SUPERNOVA** | Charge up for 4 seconds to trigger a massive explosion. |
| **👆 'L' SHAPE** | **???** | Secret Interaction. |

---

## 🛠 TECH STACK

*   **Core:** HTML5, CSS3, Vanilla JavaScript (ES6+)
*   **Rendering Engine:** [Three.js (r128)](https://threejs.org/)
*   **Computer Vision:** [MediaPipe Hands & FaceMesh](https://google.github.io/mediapipe/)
*   **Shaders:** Custom GLSL (Vertex & Fragment)
*   **Effects:** EffectComposer (UnrealBloom, AfterimagePass)

---

## 🚀 INSTALLATION & SETUP

To run this project locally on your machine:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/frinqster/IPE.git
    cd IPE
    ```

2.  **Run a Local Server:**
    Due to browser security policies regarding Camera/Microphone access (`getUserMedia`), this project **cannot** be run simply by double-clicking `index.html`. You must serve it.

    *   **VS Code (Recommended):** Install the "Live Server" extension, right-click `index.html`, and select "Open with Live Server".
    *   **Python:**
        ```bash
        # Python 3.x
        python -m http.server 8000
        ```
    *   **Node/NPM:**
        ```bash
        npx serve .
        ```

3.  **Open in Browser:**
    Navigate to `http://localhost:5500` (or the port specified by your server).

---

## ⚙️ CONFIGURATION

The system includes a built-in **Neural Calibration Menu** (Click the ⚙️ Gear icon in the bottom right).

*   **System Core:** Adjust Performance Mode (Particle Count 6k-32k), Rotation Speed, and Explosion Force.
*   **Visual Aesthetics:** Customize particle colors (HSV/RGB Picker) and Motion Blur intensity.
*   **Audio Link:** Upload local audio files and adjust Visualizer sensitivity/smoothing.
*   **Special Protocols:** Configure "Supernova" vibration/charge time and "Stealth Mode" pulse speed.
*   **Face Geometry:** Calibrate the 3D mask offset and scale to match your camera position.

---

## ⚠️ TROUBLESHOOTING

*   **"Permission Denied":** Ensure you have allowed Camera and Microphone access in your browser settings.
*   **Low FPS:** Open the settings menu and switch Performance Mode to "Low" or "Medium". Turn off Motion Blur.
*   **Gestures Not Working:** Ensure your hand is well-lit and your palm is facing the camera.
*   **More FAQs:** For a complete list of common issues and detailed solutions, please consult the **SYSTEM MANUAL** located in the **HELP** modal overlay of the live website.

---

## 👨‍💻 AUTHOR

**Syed Faiq Hussain**

*   **GitHub:** [@frinqster](https://github.com/frinqster)
*   **Email:** faiqsyed594@gmail.com

---

**© 2026 Interactive Particle Engine. All Rights Reserved.**
